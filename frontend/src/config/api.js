// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://69.197.187.24:2026';
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:2026';

export const API_ENDPOINTS = {
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  CUSTOMER_BY_ID: (id) => `${API_BASE_URL}/api/customers/${id}`,
  BILLS: `${API_BASE_URL}/api/bills`,
  BILLS_BY_CUSTOMER: (id) => `${API_BASE_URL}/api/bills/customer/${id}`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  PAYMENTS_BY_CUSTOMER: (id) => `${API_BASE_URL}/api/payments/customer/${id}`
};

export default API_BASE_URL;
