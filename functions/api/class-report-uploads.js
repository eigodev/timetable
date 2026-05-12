// Cloudflare Pages Function: class-report feed — manifest + per-asset KV values (v2).

import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { kvGetAllRoster } from '../lib/kv-all-roster.js';
import { isStudentVisibleToActor } from '../lib/roster-scope.js';

const CR_MANIFEST_KEY = 'cr_upl_manifest_v2';
const CR_UPDATED_KEY = 'cr_upl_last_updated_v2';

/** ~6 MB decoded binary per asset (base64 expands ~33%). */
const MAX_ASSET_BYTES = 6 * 1024 * 1024;
const MAX_UPLOADS_PER_STUDENT = 40;
const MAX_RELATED_FILES = 20;

function assetKvKey(assetId) {
  const safe = String(assetId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return safe ? `cr_upl_asset_v2_${safe}` : '';
}

function sanitizeAssetId(assetId, label) {
  const s = String(assetId || '').trim();
  if (!s || s.length > 140) throw new Error(`Invalid ${label} id`);
  if (!/^[a-zA-Z0-9._-]+$/.test(s)) throw new Error(`Invalid ${label} id characters`);
  return s;
}

function approxBytesFromBase64(b64Len) {
  if (!Number.isFinite(b64Len)) return 0;
  return Math.floor((b64Len * 3) / 4);
}

function coerceManifest(raw) {
  if (!raw || typeof raw !== 'object') return { students: {} };
  const students = {};
  const incoming = raw.students || raw;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return { students: {} };
  for (const [name, uploads] of Object.entries(incoming)) {
    const key = String(name || '').trim();
    if (!key) continue;
    if (!Array.isArray(uploads)) continue;
    const list = uploads
      .map((upload) => {
        try {
          if (!upload || typeof upload !== 'object') return null;
          const id = sanitizeAssetId(upload.id, 'upload');
          const rfIn = Array.isArray(upload.relatedFiles) ? upload.relatedFiles : [];
          const relatedFiles = rfIn.slice(0, MAX_RELATED_FILES).map((r) => ({
            id: sanitizeAssetId(r.id, 'related'),
            name: String(r.name || 'Related file').slice(0, 380),
            type: String(r.type || '').toLowerCase().slice(0, 120),
          }));
          const questionsRaw = Array.isArray(upload.questions) ? upload.questions : [];
          const questions = questionsRaw.map((q, index) => ({
            id: String(q?.id || `q_${id}_${index}`).slice(0, 140),
            speaker: q?.speaker === 'student' ? 'student' : 'teacher',
            text: String(q?.text || q?.question || '').slice(0, 8000),
          }));
          return {
            id,
            name: String(upload.name || 'Uploaded file').slice(0, 380),
            type: String(upload.type || '').toLowerCase().slice(0, 120),
            relatedFiles,
            questions,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    if (list.length === 0) continue;
    if (list.length > MAX_UPLOADS_PER_STUDENT) {
      students[key] = list.slice(0, MAX_UPLOADS_PER_STUDENT);
    } else {
      students[key] = list;
    }
  }
  return { students };
}

function normalizeBase64(raw) {
  const s = String(raw || '').trim();
  const i = s.indexOf('base64,');
  if (s.startsWith('data:') && i !== -1) return s.slice(i + 7);
  return s;
}

async function readAssetIntoDataUrl(KV, assetId) {
  const k = assetKvKey(assetId);
  if (!k) return '';
  const row = await KV.get(k, 'json');
  if (!row || typeof row !== 'object') return '';
  const mime = String(row.mime || 'application/octet-stream').slice(0, 120);
  const data = normalizeBase64(row.data || row.b64 || '');
  if (!data) return '';
  return `data:${mime};base64,${data}`;
}

async function writeAssetPayload(KV, assetId, mime, base64) {
  const k = assetKvKey(assetId);
  if (!k) throw new Error('Bad asset storage key');
  const body = normalizeBase64(base64);
  if (!body) throw new Error('Missing file payload');
  if (approxBytesFromBase64(body.length) > MAX_ASSET_BYTES) {
    return new Response(
      JSON.stringify({ success: false, error: 'File exceeds maximum allowed size.', code: 'PAYLOAD_TOO_LARGE' }),
      { status: 413, headers: corsJson() }
    );
  }
  await KV.put(k, JSON.stringify({ mime: String(mime || 'application/octet-stream'), data: body }));
  return null;
}

function corsHeaders(extraMethods = []) {
  const methods = ['GET', 'POST', 'OPTIONS', ...extraMethods];
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function corsJson(extra = {}) {
  return { ...extra, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
}

function filterManifestStudents(manifest, fullRoster, actor) {
  if (!actor || !fullRoster) return manifest;
  const m = coerceManifest(manifest || {});
  const next = { students: {} };
  for (const [stu, uploads] of Object.entries(m.students || {})) {
    if (isStudentVisibleToActor(fullRoster, stu, actor)) next.students[stu] = uploads;
  }
  return next;
}

function assetIdAllowedInManifest(manifest, assetId, fullRoster, actor) {
  if (!actor || !fullRoster) return true;
  if (actor.role === 'admin') return true;
  const id = String(assetId || '').trim();
  for (const [stu, list] of Object.entries(manifest.students || {})) {
    if (!isStudentVisibleToActor(fullRoster, stu, actor)) continue;
    if (!Array.isArray(list)) continue;
    for (const u of list) {
      if (u && u.id === id) return true;
      for (const r of u.relatedFiles || []) {
        if (r && r.id === id) return true;
      }
    }
  }
  return false;
}

export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.schedules_kv;
  const cors = corsHeaders();

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  if (!KV) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          'schedules_kv not configured. Bind KV namespace in Pages settings as "schedules_kv".',
      }),
      corsJson({ status: 503 })
    );
  }

  const strictBlock = rejectIfStrictAuthUnconfigured(env, () => ({
    ...corsJson().headers,
  }));
  if (strictBlock) return strictBlock;

  try {
    const secret = String(env.TIMETABLE_AUTH_SECRET || '').trim();
    const auth = await resolveRequestAuth(request, secret || null);
    if (!auth.legacy && auth.error) {
      return auth.error;
    }
    let fullRoster = null;
    let actor = null;
    if (!auth.legacy) {
      fullRoster = (await kvGetAllRoster(KV)) || {};
      actor = { role: auth.payload.role, profile: auth.payload.profile };
    }

    /** --- GET manifest (default) --- */
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const action = String(url.searchParams.get('action') || '').trim();
      /** bundle: comma-separated IDs (prefer POST for large sets) */
      if (action === 'assets') {
        const csv = String(url.searchParams.get('ids') || '').trim();
        const ids = csv
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 80);
        if (ids.length === 0) {
          return new Response(JSON.stringify({ success: true, assets: {} }), corsJson({ status: 200 }));
        }
        let manifestRawA = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRawA === 'string') {
          try {
            manifestRawA = JSON.parse(manifestRawA);
          } catch {
            manifestRawA = null;
          }
        }
        const fullManifestForAssets = coerceManifest(manifestRawA || {});
        const assets = {};
        await Promise.all(
          ids.map(async (idRaw) => {
            let idSafe;
            try {
              idSafe = sanitizeAssetId(idRaw, 'asset');
            } catch {
              return;
            }
            if (!assetIdAllowedInManifest(fullManifestForAssets, idSafe, fullRoster, actor)) {
              return;
            }
            const du = await readAssetIntoDataUrl(KV, idSafe);
            if (du) assets[idSafe] = du;
          })
        );
        return new Response(JSON.stringify({ success: true, assets }), corsJson({ status: 200 }));
      }

      let manifestRaw = await KV.get(CR_MANIFEST_KEY, 'json');
      if (typeof manifestRaw === 'string') {
        try {
          manifestRaw = JSON.parse(manifestRaw);
        } catch {
          manifestRaw = null;
        }
      }
      const manifest = filterManifestStudents(coerceManifest(manifestRaw || {}), fullRoster, actor);
      const lastUpdated = (await KV.get(CR_UPDATED_KEY, 'text')) || null;
      return new Response(
        JSON.stringify({ success: true, manifest, lastUpdated }),
        corsJson({ status: 200 })
      );
    }

    /** --- POST operations --- */
    if (request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object') {
        return new Response(JSON.stringify({ success: false, error: 'JSON body required' }), corsJson({ status: 400 }));
      }

      const action = String(body.action || 'replaceManifest').trim();

      if (action === 'fetchAssets') {
        const ids = Array.isArray(body.ids)
          ? body.ids.map(String).slice(0, 100).filter(Boolean)
          : [];
        let manifestRawF = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRawF === 'string') {
          try {
            manifestRawF = JSON.parse(manifestRawF);
          } catch {
            manifestRawF = null;
          }
        }
        const fullManifestFetch = coerceManifest(manifestRawF || {});
        const assets = {};
        await Promise.all(
          ids.map(async (idRaw) => {
            let idSafe;
            try {
              idSafe = sanitizeAssetId(idRaw, 'asset');
            } catch {
              return;
            }
            if (!assetIdAllowedInManifest(fullManifestFetch, idSafe, fullRoster, actor)) {
              return;
            }
            const du = await readAssetIntoDataUrl(KV, idSafe);
            if (du) assets[idSafe] = du;
          })
        );
        return new Response(JSON.stringify({ success: true, assets }), corsJson({ status: 200 }));
      }

      if (action === 'replaceManifest') {
        if (actor && actor.role !== 'admin') {
          return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), corsJson({ status: 403 }));
        }
        const manifest = coerceManifest(body.manifest || {});
        const timestamp = new Date().toISOString();
        await KV.put(CR_MANIFEST_KEY, JSON.stringify(manifest));
        await KV.put(CR_UPDATED_KEY, timestamp);
        return new Response(JSON.stringify({ success: true, lastUpdated: timestamp }), corsJson({ status: 200 }));
      }

      if (action === 'deleteUpload') {
        const student = String(body.student || '').trim();
        const uploadId = sanitizeAssetId(body.uploadId, 'upload');
        if (!student) {
          return new Response(JSON.stringify({ success: false, error: 'student required' }), corsJson({ status: 400 }));
        }
        if (actor && !isStudentVisibleToActor(fullRoster, student, actor)) {
          return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), corsJson({ status: 403 }));
        }
        let manifestRaw = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRaw === 'string') {
          try {
            manifestRaw = JSON.parse(manifestRaw);
          } catch {
            manifestRaw = null;
          }
        }
        const manifest = coerceManifest(manifestRaw || {});
        const bucket = manifest.students[student];
        const list = Array.isArray(bucket) ? bucket : [];
        const idx = list.findIndex((u) => u && u.id === uploadId);
        if (idx === -1) {
          const timestamp = new Date().toISOString();
          await KV.put(CR_UPDATED_KEY, timestamp);
          return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
        }
        const removed = list[idx];
        const delKeys = [uploadId];
        if (removed?.relatedFiles) {
          removed.relatedFiles.forEach((r) => {
            if (r?.id) delKeys.push(String(r.id));
          });
        }
        await Promise.all(
          delKeys.map(async (kid) => {
            const kk = assetKvKey(kid);
            if (kk) await KV.delete(kk).catch(() => {});
          })
        );
        list.splice(idx, 1);
        if (list.length === 0) delete manifest.students[student];
        else manifest.students[student] = list;
        const timestamp = new Date().toISOString();
        await KV.put(CR_MANIFEST_KEY, JSON.stringify(manifest));
        await KV.put(CR_UPDATED_KEY, timestamp);
        return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
      }

      if (action === 'renameStudentBucket') {
        if (actor && actor.role !== 'admin') {
          return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), corsJson({ status: 403 }));
        }
        const fromName = String(body.fromStudent || '').trim();
        const toName = String(body.toStudent || '').trim();
        if (!fromName || !toName || fromName === toName) {
          return new Response(JSON.stringify({ success: false, error: 'fromStudent and toStudent required' }), corsJson({ status: 400 }));
        }
        let manifestRaw = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRaw === 'string') {
          try {
            manifestRaw = JSON.parse(manifestRaw);
          } catch {
            manifestRaw = null;
          }
        }
        const manifest = coerceManifest(manifestRaw || {});
        const bucket = manifest.students[fromName];
        if (bucket && Array.isArray(bucket)) {
          manifest.students[toName] = bucket;
          delete manifest.students[fromName];
        }
        const timestamp = new Date().toISOString();
        await KV.put(CR_MANIFEST_KEY, JSON.stringify(manifest));
        await KV.put(CR_UPDATED_KEY, timestamp);
        return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
      }

      if (action === 'patchUploadMeta') {
        const student = String(body.student || '').trim();
        const uploadId = sanitizeAssetId(body.uploadId, 'upload');
        if (!student) {
          return new Response(JSON.stringify({ success: false, error: 'student required' }), corsJson({ status: 400 }));
        }
        if (actor && !isStudentVisibleToActor(fullRoster, student, actor)) {
          return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), corsJson({ status: 403 }));
        }
        let manifestRaw = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRaw === 'string') {
          try {
            manifestRaw = JSON.parse(manifestRaw);
          } catch {
            manifestRaw = null;
          }
        }
        const manifest = coerceManifest(manifestRaw || {});
        const list = manifest.students[student];
        if (!Array.isArray(list)) {
          const timestamp = new Date().toISOString();
          await KV.put(CR_UPDATED_KEY, timestamp);
          return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
        }
        const u = list.find((x) => x && x.id === uploadId);
        if (!u) {
          const timestamp = new Date().toISOString();
          await KV.put(CR_UPDATED_KEY, timestamp);
          return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
        }
        if (Array.isArray(body.questions)) {
          const questionsRaw = body.questions;
          u.questions = questionsRaw.map((q, index) => ({
            id: String(q?.id || `q_${uploadId}_${index}`).slice(0, 140),
            speaker: q?.speaker === 'student' ? 'student' : 'teacher',
            text: String(q?.text || q?.question || '').slice(0, 8000),
          }));
        }
        if (Array.isArray(body.relatedFiles)) {
          const rfIn = body.relatedFiles.slice(0, MAX_RELATED_FILES);
          u.relatedFiles = rfIn.map((r) => ({
            id: sanitizeAssetId(r.id, 'related'),
            name: String(r.name || 'Related file').slice(0, 380),
            type: String(r.type || '').toLowerCase().slice(0, 120),
          }));
        }
        const timestamp = new Date().toISOString();
        await KV.put(CR_MANIFEST_KEY, JSON.stringify(manifest));
        await KV.put(CR_UPDATED_KEY, timestamp);
        return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
      }

      if (action === 'putUpload') {
        const student = String(body.student || '').trim();
        if (!student) {
          return new Response(JSON.stringify({ success: false, error: 'student required' }), corsJson({ status: 400 }));
        }
        if (actor && !isStudentVisibleToActor(fullRoster, student, actor)) {
          return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), corsJson({ status: 403 }));
        }
        let uploadRaw = body.upload;
        if (!uploadRaw || typeof uploadRaw !== 'object') {
          return new Response(JSON.stringify({ success: false, error: 'upload object required' }), corsJson({ status: 400 }));
        }
        const uploadId = sanitizeAssetId(uploadRaw.id, 'upload');

        /** Main blob */
        const mainMime = String(uploadRaw.type || body.mainMime || 'application/octet-stream').toLowerCase().slice(0, 120);
        const wb = await writeAssetPayload(KV, uploadId, mainMime, body.mainBase64);
        if (wb) return wb;

        const relatedPairs = {};
        const relSrc = typeof body.relatedBase64 === 'object' && body.relatedBase64 ? body.relatedBase64 : {};

        /** Build canonical upload row before related assets */
        const relatedMeta = [];
        const rfProvided = Array.isArray(uploadRaw.relatedFiles) ? uploadRaw.relatedFiles : [];
        rfProvided.forEach((r) => {
          const rid = sanitizeAssetId(r.id, 'related');
          relatedMeta.push({
            id: rid,
            name: String(r.name || 'Related file').slice(0, 380),
            type: String(r.type || '').toLowerCase().slice(0, 120),
          });
          if (Object.prototype.hasOwnProperty.call(relSrc, rid)) {
            relatedPairs[rid] = relSrc[rid];
          }
        });

        for (const [rid, b64] of Object.entries(relatedPairs)) {
          const meta = relatedMeta.find((x) => x.id === rid);
          const mime = meta ? meta.type : 'application/octet-stream';
          const err = await writeAssetPayload(KV, rid, mime, b64);
          if (err) return err;
        }

        const questionsRaw = Array.isArray(uploadRaw.questions) ? uploadRaw.questions : [];
        const questions = questionsRaw.map((q, index) => ({
          id: String(q?.id || `q_${uploadId}_${index}`).slice(0, 140),
          speaker: q?.speaker === 'student' ? 'student' : 'teacher',
          text: String(q?.text || q?.question || '').slice(0, 8000),
        }));

        const row = {
          id: uploadId,
          name: String(uploadRaw.name || 'Uploaded file').slice(0, 380),
          type: mainMime,
          relatedFiles: relatedMeta,
          questions,
        };

        let manifestRaw = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRaw === 'string') {
          try {
            manifestRaw = JSON.parse(manifestRaw);
          } catch {
            manifestRaw = null;
          }
        }
        const manifest = coerceManifest(manifestRaw || {});
        const list = Array.isArray(manifest.students[student]) ? [...manifest.students[student]] : [];
        const existingIdx = list.findIndex((item) => item && item.id === uploadId);

        /** Remove orphaned related asset KV keys replaced by omit */
        const oldRow = existingIdx >= 0 ? list[existingIdx] : null;
        if (oldRow?.relatedFiles) {
          const nextRfIds = new Set(relatedMeta.map((r) => r.id));
          for (const rf of oldRow.relatedFiles) {
            if (!nextRfIds.has(rf.id) && rf.id) {
              const dk = assetKvKey(rf.id);
              if (dk) await KV.delete(dk).catch(() => {});
            }
          }
        }

        if (existingIdx >= 0) list[existingIdx] = row;
        else {
          list.push(row);
          if (list.length > MAX_UPLOADS_PER_STUDENT) list.splice(0, list.length - MAX_UPLOADS_PER_STUDENT);
        }
        manifest.students[student] = list;
        const timestamp = new Date().toISOString();
        await KV.put(CR_MANIFEST_KEY, JSON.stringify(manifest));
        await KV.put(CR_UPDATED_KEY, timestamp);

        return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
      }

      if (action === 'addRelatedUpload') {
        const student = String(body.student || '').trim();
        const uploadId = sanitizeAssetId(body.uploadId, 'upload');
        const rel = body.relatedFile;
        if (!student || !rel || typeof rel !== 'object') {
          return new Response(JSON.stringify({ success: false, error: 'student, uploadId, relatedFile required' }), corsJson({ status: 400 }));
        }
        if (actor && !isStudentVisibleToActor(fullRoster, student, actor)) {
          return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), corsJson({ status: 403 }));
        }
        const rid = sanitizeAssetId(rel.id, 'related');

        let manifestRaw = await KV.get(CR_MANIFEST_KEY, 'json');
        if (typeof manifestRaw === 'string') {
          try {
            manifestRaw = JSON.parse(manifestRaw);
          } catch {
            manifestRaw = null;
          }
        }
        const manifest = coerceManifest(manifestRaw || {});
        const list = manifest.students[student];
        if (!Array.isArray(list)) {
          return new Response(JSON.stringify({ success: false, error: 'Unknown student bucket' }), corsJson({ status: 404 }));
        }
        const u = list.find((x) => x && x.id === uploadId);
        if (!u) {
          return new Response(JSON.stringify({ success: false, error: 'Upload not found' }), corsJson({ status: 404 }));
        }

        const err = await writeAssetPayload(KV, rid, String(rel.type || '').toLowerCase(), body.relatedBase64);
        if (err) return err;

        if (!Array.isArray(u.relatedFiles)) u.relatedFiles = [];
        const meta = {
          id: rid,
          name: String(rel.name || 'Related file').slice(0, 380),
          type: String(rel.type || '').toLowerCase().slice(0, 120),
        };
        const filtered = u.relatedFiles.filter((x) => x && x.id !== rid).slice(-(MAX_RELATED_FILES - 1));
        filtered.push(meta);
        u.relatedFiles = filtered;

        const timestamp = new Date().toISOString();
        await KV.put(CR_MANIFEST_KEY, JSON.stringify(manifest));
        await KV.put(CR_UPDATED_KEY, timestamp);

        return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, manifest }), corsJson({ status: 200 }));
      }

      return new Response(JSON.stringify({ success: false, error: 'Unknown action', action }), corsJson({ status: 400 }));
    }

    return new Response('Method not allowed', { status: 405, headers: cors });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), corsJson({ status: 500 }));
  }
}
