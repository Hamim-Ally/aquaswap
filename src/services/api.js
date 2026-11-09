/**
 * AquaSwap API Service Layer
 * Interfaces with the Express + SQLite backend (/api) with automatic JWT token management.
 * Designed to mirror future Supabase API structures for smooth migration.
 */

const API_BASE = '/api';

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('aquaswap_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// ==========================================
// AUTHENTICATION API
// ==========================================
export const authAPI = {
  /**
   * Register a new facility account
   */
  async signup(payload) {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.token) {
      localStorage.setItem('aquaswap_token', data.token);
      localStorage.setItem('aquaswap_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signin(email, password) {
    const data = await request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem('aquaswap_token', data.token);
      localStorage.setItem('aquaswap_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * 1-Click login for mock/demo industrial company facilities
   */
  async demoLogin(accountOrEmail) {
    const payload = typeof accountOrEmail === 'string'
      ? { email: accountOrEmail }
      : {
          email: accountOrEmail.email,
          name: accountOrEmail.name,
          role: accountOrEmail.role,
          clusterId: accountOrEmail.clusterId,
          sector: accountOrEmail.sector,
          volume: accountOrEmail.volume
        };

    const data = await request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.token) {
      localStorage.setItem('aquaswap_token', data.token);
      localStorage.setItem('aquaswap_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Get current authenticated user session
   */
  async getMe() {
    return await request('/auth/me');
  },

  /**
   * Sign out
   */
  logout() {
    localStorage.removeItem('aquaswap_token');
    localStorage.removeItem('aquaswap_user');
  }
};

// ==========================================
// FACILITIES API
// ==========================================
export const facilitiesAPI = {
  /**
   * Fetch all facilities (optionally filtered by clusterId and type)
   */
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/facilities${query ? `?${query}` : ''}`);
  },

  /**
   * Create a new facility in the database
   */
  async create(facilityData) {
    return await request('/facilities', {
      method: 'POST',
      body: JSON.stringify(facilityData)
    });
  },

  /**
   * Delete facility
   */
  async delete(id) {
    return await request(`/facilities/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================
// CLUSTERS API
// ==========================================
export const clustersAPI = {
  /**
   * Fetch all clusters populated with live facilities from SQLite
   */
  async getAll() {
    return await request('/clusters');
  }
};

// ==========================================
// WATER AGREEMENTS API
// ==========================================
export const agreementsAPI = {
  /**
   * List all bilateral water agreements
   */
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/agreements${query ? `?${query}` : ''}`);
  },

  /**
   * Register a new Water Purchase Agreement
   */
  async create(agreementData) {
    return await request('/agreements', {
      method: 'POST',
      body: JSON.stringify(agreementData)
    });
  },

  /**
   * Update agreement status
   */
  async updateStatus(id, status) {
    return await request(`/agreements/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

// ==========================================
// HEALTH & STATS API
// ==========================================
export const systemAPI = {
  async getHealth() {
    return await request('/health');
  }
};
