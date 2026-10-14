// Local API URL (commented out)
// const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = '/api';

// Live Production Vercel Backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://super-market-backend-zeta.vercel.app/api';

export const getToken = () => {
  return localStorage.getItem('token') || '';
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const method = (options.method || 'GET').toUpperCase();
  const hasBody = options.body !== undefined && options.body !== null;

  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Prevent stale 304 responses from being treated as failures
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    ...options.headers,
  };

  const config = {
    ...options,
    method,
    headers,
    // Force a fresh network response — avoids empty-body 304 breaking JSON parse
    cache: 'no-store',
  };

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (_) {
        data = {
          message:
            response.status === 304
              ? 'Cached response could not be read. Please refresh.'
              : 'Invalid JSON response from server.',
        };
      }
    } else {
      const text = await response.text();
      data = {
        message:
          text ||
          (response.status === 500
            ? 'Server error occurred on backend.'
            : response.status === 304
              ? 'Not modified (empty cache body).'
              : 'Unexpected server response.'),
      };
    }

    // 304 is not in the 2xx range, so response.ok is false — treat it carefully
    if (!response.ok && response.status !== 304) {
      const error = new Error(data.message || `API request failed (${response.status})`);
      error.status = response.status;
      error.code = data.code || 'API_ERROR';
      error.data = data;
      throw error;
    }

    // If we somehow still get a bare 304 with no usable payload, fail clearly
    if (response.status === 304 && (data == null || data.message)) {
      const error = new Error(data?.message || 'Products cache returned 304 with no body');
      error.status = 304;
      error.code = 'CACHE_STALE';
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${method} ${endpoint}:`, error.message);
    throw error;
  }
};

export const get = (endpoint, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`${endpoint}${queryString}`, { method: 'GET' });
};

export const post = (endpoint, body = {}) => {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const patch = (endpoint, body = {}) => {
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

export const del = (endpoint) => {
  return request(endpoint, { method: 'DELETE' });
};

const ApiClient = {
  getToken,
  setToken,
  request,
  get,
  post,
  patch,
  delete: del,
};

export default ApiClient;
