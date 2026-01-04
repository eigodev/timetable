// Cloudflare Pages Function to handle schedule data
// This runs as a Cloudflare Worker on the edge

export async function onRequest(context) {
  const { request, env } = context;
  const KV_SCHEDULES = env.KV_SCHEDULES; // KV namespace binding
  
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

  // Check if KV is configured
  if (!KV_SCHEDULES) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'KV_SCHEDULES not configured. Please bind KV namespace in Pages settings.',
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
      // Get all schedules from KV
      const schedules = await KV_SCHEDULES.get('all_schedules', 'json');
      const lastUpdated = await KV_SCHEDULES.get('last_updated', 'text');
      
      console.log('Retrieved schedules from KV:', {
        hasSchedules: !!schedules,
        teacherCount: schedules ? Object.keys(schedules).length : 0,
        lastUpdated: lastUpdated
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          schedules: schedules || {},
          lastUpdated: lastUpdated || null,
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
      const timestamp = new Date().toISOString();
      
      // Convert schedules to string for storage
      const schedulesString = JSON.stringify(schedules);
      
      // Save schedules and timestamp
      await KV_SCHEDULES.put('all_schedules', schedulesString);
      await KV_SCHEDULES.put('last_updated', timestamp);
      
      console.log('Saved schedules to KV:', {
        teachers: Object.keys(schedules).length,
        timestamp: timestamp,
        size: schedulesString.length
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          lastUpdated: timestamp,
          message: 'Schedules saved successfully',
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
        details: error.stack,
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

