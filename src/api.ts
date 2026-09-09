import { API_BASE_URL, API_ORIGIN } from './config';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function fetchCategories() {
  const response = await fetch(`${API_ORIGIN}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function fetchOrders() {
  const response = await fetch(`${API_ORIGIN}/orders`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

export async function fetchPages() {
  const response = await fetch(`${API_ORIGIN}/pages`);
  if (!response.ok) {
    throw new Error('Failed to fetch pages');
  }
  return response.json();
}

export async function updateOrderStatus(id: number, status: string) {
  const response = await fetch(`${API_ORIGIN}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  return response.json();
}

export async function fetchCoupons() {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch coupons');
  }
  return response.json();
}

export async function createCoupon(payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to create coupon');
  }
  return response.json();
}

export async function deleteCoupon(id: number) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete coupon');
  }
  return response.json();
}

export async function fetchWalletTransactions() {
  const response = await fetch(`${API_ORIGIN}/commerce/wallet`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch wallet transactions');
  return response.json();
}

export async function createWalletTransaction(payload: Record<string, unknown>) {
  const response = await fetch(`${API_ORIGIN}/commerce/wallet/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create wallet transaction');
  return response.json();
}

export async function fetchRewardTransactions() {
  const response = await fetch(`${API_ORIGIN}/commerce/rewards`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch reward transactions');
  return response.json();
}

export async function createRewardTransaction(payload: Record<string, unknown>) {
  const response = await fetch(`${API_ORIGIN}/commerce/rewards/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create reward transaction');
  return response.json();
}

export async function fetchVendors() {
  const response = await fetch(`${API_ORIGIN}/commerce/vendors`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch vendors');
  return response.json();
}

export async function createVendor(payload: Record<string, unknown>) {
  const response = await fetch(`${API_ORIGIN}/commerce/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create vendor');
  return response.json();
}

export async function fetchVendorSettlements() {
  const response = await fetch(`${API_ORIGIN}/commerce/vendor-settlements`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch vendor settlements');
  return response.json();
}

export async function createVendorSettlement(payload: Record<string, unknown>) {
  const response = await fetch(`${API_ORIGIN}/commerce/vendor-settlements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create vendor settlement');
  return response.json();
}

export function invoicePdfUrl(orderId: number) {
  const token = localStorage.getItem('token');
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${API_ORIGIN}/commerce/orders/${orderId}/invoice.pdf${query}`;
}

export async function createCategory(name: string) {
  const response = await fetch(`${API_ORIGIN}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create category');
  }

  return response.json();
}
