import { BASE_URL } from './index';

export type RawMaterial = {
  id: string;
  code: string | null;
  name: string | null;
  category_id: string;
  unit: string | null;
  stock: number | null;
  min_stock: number | null;
  buy_price: number | null;
  image: string | null;
  created_at: string;
  modified_at: string;
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function getRawMaterials(): Promise<RawMaterial[]> {
  const res = await fetch(`${BASE_URL}/api/raw-materials`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<RawMaterial[]> = await res.json();
  if (!json.success) throw new Error('Failed to fetch raw materials');
  return json.data;
}

export async function getRawMaterialById(id: string): Promise<RawMaterial> {
  const res = await fetch(`${BASE_URL}/api/raw-materials/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<RawMaterial> = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to fetch raw material');
  return json.data;
}

export async function createRawMaterial(payload: {
  category_id: string;
  code?: string;
  name?: string;
  unit?: string;
  stock?: number;
  min_stock?: number;
  buy_price?: number;
  image?: string;
}): Promise<RawMaterial> {
  const res = await fetch(`${BASE_URL}/api/raw-materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<RawMaterial> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

export async function updateRawMaterial(id: string, payload: {
  code?: string;
  name?: string;
  category_id?: string;
  unit?: string;
  stock?: number;
  min_stock?: number;
  buy_price?: number;
  image?: string;
}): Promise<RawMaterial> {
  const res = await fetch(`${BASE_URL}/api/raw-materials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<RawMaterial> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

export async function deleteRawMaterial(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/raw-materials/${id}`, { method: 'DELETE' });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
}
