// Cloudflare Pages Function to handle schedule data
// This runs as a Cloudflare Worker on the edge

export async function onRequest(context) {
  const { request, env } = context;
  const { KV_SCHEDULES } = env; // KV namespace binding
  
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (request.method === 'GET') {
      // Get all schedules from KV
      const schedules = await KV_SCHEDULES.get('all_schedules', 'json');
      
      return new Response(
        JSON.stringify({
          success: true,
          schedules: schedules || {},
          lastUpdated: schedules ? await KV_SCHEDULES.get('last_updated', 'text') : null,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (request.method === 'POST') {
      // Save schedules to KV
      const body = await request.json();
      const { schedules } = body;
      
      if (!schedules) {
        return new Response(
          JSON.stringify({ success: false, error: 'Schedules data required' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      // Save to KV
      await KV_SCHEDULES.put('all_schedules', JSON.stringify(schedules));
      const timestamp = new Date().toISOString();
      await KV_SCHEDULES.put('last_updated', timestamp);
      
      return new Response(
        JSON.stringify({
          success: true,
          lastUpdated: timestamp,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.error('Error:', error);
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

