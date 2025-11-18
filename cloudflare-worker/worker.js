/**
 * Vision Board - Cloudflare Worker
 *
 * 기능:
 * 1. 이미지 프록시 (CORS 해결)
 * 2. 비전보드 데이터 저장/불러오기 (짧은 링크 생성)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS 헤더 설정
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ============================================
      // 기능 1: 이미지 프록시
      // ============================================
      if (url.pathname === '/proxy') {
        return handleImageProxy(request, corsHeaders);
      }

      // ============================================
      // 기능 2: 비전보드 데이터 저장
      // ============================================
      if (url.pathname === '/save' && request.method === 'POST') {
        return handleSave(request, env, corsHeaders);
      }

      // ============================================
      // 기능 3: 비전보드 데이터 불러오기
      // ============================================
      if (url.pathname === '/load' && request.method === 'GET') {
        return handleLoad(request, env, corsHeaders);
      }

      // ============================================
      // 기본 응답 (헬스 체크)
      // ============================================
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'Vision Board API',
          version: '1.0.0',
          endpoints: {
            '/proxy?url=<IMAGE_URL>': 'Image proxy (CORS bypass)',
            '/save': 'Save vision board data (POST)',
            '/load?id=<ID>': 'Load vision board data (GET)',
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message || 'Internal server error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  }
};

/**
 * 이미지 프록시 핸들러
 * 외부 이미지를 CORS 헤더와 함께 반환
 */
async function handleImageProxy(request, corsHeaders) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing url parameter' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }

  try {
    // 원본 이미지 가져오기
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Vision-Board-Proxy/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // 새로운 응답 생성 (CORS 헤더 추가)
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // 24시간 캐시
      }
    });

    return newResponse;

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to proxy image: ${error.message}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

/**
 * 비전보드 데이터 저장 핸들러
 * KV에 데이터를 저장하고 짧은 ID 반환
 */
async function handleSave(request, env, corsHeaders) {
  try {
    const data = await request.json();

    if (!data.items || !Array.isArray(data.items)) {
      return new Response(
        JSON.stringify({ error: 'Invalid data format. Expected { items: [...] }' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // 짧은 ID 생성 (6자리, 알파벳+숫자)
    const id = generateShortId();

    // KV에 저장 (1년 만료)
    const visionBoardData = {
      items: data.items,
      createdAt: new Date().toISOString(),
      version: '1.0'
    };

    await env.VISION_BOARD_KV.put(
      id,
      JSON.stringify(visionBoardData),
      {
        expirationTtl: 60 * 60 * 24 // 1일 (초 단위)
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        id: id,
        expiresIn: '1 day'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to save data: ${error.message}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

/**
 * 비전보드 데이터 불러오기 핸들러
 * KV에서 ID로 데이터 조회
 */
async function handleLoad(request, env, corsHeaders) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Missing id parameter' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }

  try {
    // KV에서 데이터 조회
    const data = await env.VISION_BOARD_KV.get(id);

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Vision board not found or expired' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // 데이터 파싱
    const visionBoardData = JSON.parse(data);

    // 만료 시간 검증 (1일 = 86400000ms)
    const createdAt = new Date(visionBoardData.createdAt);
    const now = new Date();
    const expirationTime = 24 * 60 * 60 * 1000; // 1일 (밀리초)

    if (now - createdAt > expirationTime) {
      // 만료된 데이터는 삭제하고 404 반환
      await env.VISION_BOARD_KV.delete(id);

      return new Response(
        JSON.stringify({ error: 'Vision board not found or expired' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // 데이터 반환
    return new Response(
      JSON.stringify({
        success: true,
        ...visionBoardData
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1시간 캐시
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to load data: ${error.message}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

/**
 * 짧은 ID 생성 (6자리, URL-safe)
 * 예: 'a3x9k2'
 */
function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
