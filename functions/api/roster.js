// Cloudflare Pages Function to handle roster data
// Uses the same KV binding name used by schedules: "schedules_kv"

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
        error: 'schedules_kv not configured. Please bind KV namespace in Pages settings with variable name "schedules_kv".',
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
      const roster = await KV.get('all_roster', 'json');
      const lastUpdated = await KV.get('roster_last_updated', 'text');
      return new Response(
        JSON.stringify({
          success: true,
          roster: roster || null,
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
      const { roster } = body || {};
      if (!roster || typeof roster !== 'object') {
        return new Response(
          JSON.stringify({ success: false, error: 'Roster data required' }),
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
      await KV.put('all_roster', JSON.stringify(roster));
      await KV.put('roster_last_updated', timestamp);

      return new Response(
        JSON.stringify({
          success: true,
          lastUpdated: timestamp,
          message: 'Roster saved successfully',
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

