// Cloudflare Pages Function: class report file feed (per-student uploads, data URLs).
// Uses KV binding "schedules_kv" — same namespace as roster and schedules.

export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.schedules_kv;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!KV) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          'schedules_kv not configured. Please bind KV namespace in Pages settings with variable name "schedules_kv".',
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    if (request.method === 'GET') {
      const uploads = await KV.get('class_report_uploads', 'json');
      const lastUpdated = await KV.get('class_report_uploads_last_updated', 'text');
      return new Response(
        JSON.stringify({
          success: true,
          uploads: uploads || null,
          lastUpdated: lastUpdated || null,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const uploads = body && typeof body.uploads === 'object' ? body.uploads : null;
      if (!uploads || Array.isArray(uploads)) {
        return new Response(
          JSON.stringify({ success: false, error: 'uploads object required' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const timestamp = new Date().toISOString();
      await KV.put('class_report_uploads', JSON.stringify(uploads));
      await KV.put('class_report_uploads_last_updated', timestamp);

      return new Response(
        JSON.stringify({
          success: true,
          lastUpdated: timestamp,
          message: 'Class report uploads saved successfully',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
