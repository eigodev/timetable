/**
 * IndexedDB cache for class-report binary assets + small meta keys (v2).
 * Loaded before script.js; attaches `window.ClassReportUploadsStore`.
 */
(function attachClassReportUploadsStore(globalScope) {
    const DB_NAME = 'timetable_class_report_feed_v2';
    const DB_VER = 1;
    const STORE_BLOB = 'assetBlob';
    const STORE_META = 'meta';

    function openDb() {
        return new Promise((resolve, reject) => {
            if (!globalScope.indexedDB) {
                reject(new Error('IndexedDB unavailable'));
                return;
            }
            const req = globalScope.indexedDB.open(DB_NAME, DB_VER);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_BLOB)) db.createObjectStore(STORE_BLOB);
                if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META);
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
        });
    }

    function withTx(storeNames, mode, work) {
        return openDb().then(
            (db) =>
                new Promise((resolve, reject) => {
                    try {
                        const tx = db.transaction(storeNames, mode);
                        tx.onerror = () => reject(tx.error);
                        tx.oncomplete = () => {
                            db.close();
                            resolve(undefined);
                        };
                        work(tx);
                    } catch (e) {
                        db.close();
                        reject(e);
                    }
                })
        );
    }

    const ClassReportUploadsStore = {
        DB_NAME,
        STORE_BLOB,
        STORE_META,

        blobToPureBase64(blob) {
            return new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => {
                    const s = String(fr.result || '');
                    const i = s.indexOf('base64,');
                    if (s.startsWith('data:') && i !== -1) resolve(s.slice(i + 7));
                    else reject(new Error('Unexpected FileReader output'));
                };
                fr.onerror = () => reject(fr.error);
                fr.readAsDataURL(blob);
            });
        },

        async dataUrlToBlob(dataUrl) {
            const res = await fetch(String(dataUrl || ''));
            return res.blob();
        },

        putBlob(assetId, blob) {
            const id = String(assetId || '').trim();
            if (!id || !(blob instanceof Blob)) return Promise.resolve();
            return withTx([STORE_BLOB], 'readwrite', (tx) => {
                tx.objectStore(STORE_BLOB).put(blob, id);
            });
        },

        getBlob(assetId) {
            const id = String(assetId || '').trim();
            if (!id) return Promise.resolve(null);
            return openDb().then(
                (db) =>
                    new Promise((resolve, reject) => {
                        try {
                            const tx = db.transaction([STORE_BLOB], 'readonly');
                            const req = tx.objectStore(STORE_BLOB).get(id);
                            tx.oncomplete = () => db.close();
                            req.onsuccess = () => resolve(req.result === undefined ? null : req.result);
                            req.onerror = () => reject(req.error);
                        } catch (e) {
                            db.close();
                            reject(e);
                        }
                    })
            );
        },

        deleteBlob(assetId) {
            const id = String(assetId || '').trim();
            if (!id) return Promise.resolve();
            return withTx([STORE_BLOB], 'readwrite', (tx) => {
                tx.objectStore(STORE_BLOB).delete(id);
            });
        },

        deleteManyBlobs(ids) {
            const list = (Array.isArray(ids) ? ids : []).map((x) => String(x || '').trim()).filter(Boolean);
            if (!list.length) return Promise.resolve();
            return withTx([STORE_BLOB], 'readwrite', (tx) => {
                const st = tx.objectStore(STORE_BLOB);
                list.forEach((id) => st.delete(id));
            });
        },

        metaPut(key, value) {
            return withTx([STORE_META], 'readwrite', (tx) => {
                tx.objectStore(STORE_META).put(value, key);
            });
        },

        metaGet(key) {
            return openDb().then(
                (db) =>
                    new Promise((resolve, reject) => {
                        try {
                            const tx = db.transaction([STORE_META], 'readonly');
                            const req = tx.objectStore(STORE_META).get(key);
                            tx.oncomplete = () => db.close();
                            req.onsuccess = () => resolve(req.result === undefined ? null : req.result);
                            req.onerror = () => reject(req.error);
                        } catch (e) {
                            db.close();
                            reject(e);
                        }
                    })
            );
        },

        clearAllBlobs() {
            return withTx([STORE_BLOB], 'readwrite', (tx) => {
                tx.objectStore(STORE_BLOB).clear();
            });
        },

        purgeLegacyUploadDatabase(legacyDbName) {
            if (!globalScope.indexedDB || !legacyDbName) return;
            try {
                globalScope.indexedDB.deleteDatabase(legacyDbName);
            } catch {
                /* ignore */
            }
        }
    };

    globalScope.ClassReportUploadsStore = ClassReportUploadsStore;
})(typeof window !== 'undefined' ? window : globalThis);
