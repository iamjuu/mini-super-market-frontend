const API_BASE_URL = '/api';

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

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = {
        message: text || (response.status === 500 ? 'Server error occurred on backend.' : 'Unexpected server response.'),
      };
    }

    if (!response.ok) {
      const error = new Error(data.message || `API request failed (${response.status})`);
      error.status = response.status;
      error.code = data.code || 'API_ERROR';
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
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
