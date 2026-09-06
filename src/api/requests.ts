import { BASE_URL } from './index';

export type RequestItem = {
  id: string;
  product_id: string;
  product_name: string | null;
  qty_req: number | null;
  qty_app: number | null;
  qty_del: number | null;
};

export type Request = {
  id: string;
  code: string | null;
  status: string | null;
  tot_amount: number | null;
  req_by: string | null;
  pro_by: string | null;
  reject_reason: string | null;
  notes: string | null;
  created_at: string;
  modified_at: string;
  items: RequestItem[];
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function getRequests(): Promise<Request[]> {
  const res = await fetch(`${BASE_URL}/api/requests`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<Request[]> = await res.json();
  if (!json.success) throw new Error('Failed to fetch requests');
  return json.data;
}

export async function getRequestById(id: string): Promise<Request> {
  const res = await fetch(`${BASE_URL}/api/requests/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<Request> = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to fetch request');
  return json.data;
}

export async function createRequest(payload: {
  code?: string;
  req_by?: string;
  notes?: string;
  items: { product_id: string; qty_req: number }[];
}): Promise<Request> {
  const res = await fetch(`${BASE_URL}/api/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'pending', ...payload }),
  });
  const json: ApiResponse<Request> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

export async function updateRequest(id: string, payload: {
  req_by?: string;
  notes?: string;
  items: { product_id: string; qty_req: number }[];
}): Promise<Request> {
  const res = await fetch(`${BASE_URL}/api/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<Request> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

export async function deleteRequest(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/requests/${id}`, { method: 'DELETE' });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
}

export async function patchRequestStatus(id: string, payload: {
  status: string;
  items?: { id: string; qty_del: number }[];
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/requests/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
}
