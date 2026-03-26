/**
 * JWT-authenticated API client for Poly AI Playground
 *
 * All OpenAI API calls are routed through the backend with JWT token authentication.
 * This module provides common functions for making authenticated API requests.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

// Backend URL configuration
// Development/Production環境に応じてconfig.jsのapiUrlが自動切り替えされます
const backendUrl = (window.CONFIG && window.CONFIG.apiUrl)
  ? window.CONFIG.apiUrl
  : 'https://devplayground.polarislabs.ai.kr/api-v1';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Cookie読み取りヘルパー
 * @param {string} name - Cookie名
 * @returns {string} Cookie値 (存在しない場合は空文字列)
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

/**
 * JWT token取得 (Cookie優先、なければlocalStorage)
 * Platform standard: Cookie (Primary) + localStorage (Backup) with auto-sync
 *
 * @returns {string} JWT token
 */
function getJwtToken() {
  // 1. 쿠키 우선 확인 (Primary storage)
  let token = getCookie('access_token');

  // 2. 쿠키 없으면 localStorage에서 가져와서 쿠키에 동기화 (Backup → Primary sync)
  if (!token) {
    const backupToken = localStorage.getItem('authToken');
    if (backupToken) {
      // 쿠키에 복사하여 동기화 (15분 만료 = 900초)
      document.cookie = `access_token=${backupToken}; path=/; max-age=900; SameSite=Lax`;
      token = backupToken;
    }
  }

  return token || '';
}

/**
 * 401 unauthorized処理: tokenが期限切れの場合、ログインページに移動
 */
function handleUnauthorized() {
  alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
  window.location.href = 'https://playground.polarislabs.ai.kr/'; // Poly AI Playground login
}

// ─── OpenAI API Call Functions ───────────────────────────────────────────────

/**
 * [一般] 共通 OpenAI API 호출 함수 (JSON / Blob)
 *
 * @param {string} endpoint - API endpoint path (e.g., '/chat/completions', '/audio/speech')
 * @param {object} payload - Request payload
 * @returns {Promise<object|Blob>} API response data or Blob (for TTS audio)
 *
 * @example
 * // Chat completion
 * const data = await callOpenAIAPI('/chat/completions', {
 *   model: 'gpt-4o',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 *
 * @example
 * // TTS audio (returns Blob)
 * const audioBlob = await callOpenAIAPI('/audio/speech', {
 *   model: 'tts-1',
 *   input: 'Hello world',
 *   voice: 'alloy'
 * });
 * const audioUrl = URL.createObjectURL(audioBlob);
 * const audio = new Audio(audioUrl);
 * audio.play();
 */
export async function callOpenAIAPI(endpoint, payload) {
  const jwtToken = getJwtToken();
  const url = `${backendUrl}${endpoint}`;

  // 最大3回再試行
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleUnauthorized();
        return null;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // Backend wrapping format: { code: "200", data: { ... } }
        if ((data.code === '200' || data.code === 200) && data.data) {
          return data.data;
        }
        // Direct format: { choices: [...] } or { data: [...] }
        return data;
      } else {
        // Binary response (audio TTS etc.) → return Blob
        return response.blob();
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === 2) throw error;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Backend API call failed after multiple retries.');
}

/**
 * [Streaming] /chat/stream 専用関数
 *
 * @param {string} endpoint - Streaming endpoint (e.g., '/chat/stream')
 * @param {object} payload - Request payload
 * @param {function} onChunk - Callback when token arrives (receives text chunk)
 * @param {function} onDone - Callback when streaming completes
 *
 * @example
 * let fullText = '';
 * await callStreamingAPI('/chat/stream', payload,
 *   (chunk) => {
 *     fullText += chunk;
 *     document.getElementById('output').textContent = fullText;
 *   },
 *   () => {
 *     console.log('Streaming complete:', fullText);
 *   }
 * );
 */
export async function callStreamingAPI(endpoint, payload, onChunk, onDone) {
  const jwtToken = getJwtToken();
  const url = `${backendUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({ ...payload, stream: true })
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  if (!response.ok) {
    throw new Error(`Streaming API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // SSE format: "data: {...}\n\n" parsing
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    for (const line of lines) {
      const jsonStr = line.replace('data: ', '').trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed?.choices?.[0]?.delta?.content || '';
        if (text) onChunk(text);
      } catch {
        // Ignore parsing failure chunks
      }
    }
  }

  if (onDone) onDone();
}

// ─── Export backend URL for reference ─────────────────────────────────────────

export { backendUrl };
