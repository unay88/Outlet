import { BASE_URL } from './index';

export type ProductDetail = {
  id: string;
  raw_id: string;
  raw_name: string | null;
  unit: string | null;
  conversion: number | null;
};

export type Product = {
  id: string;
  code: string | null;
  name: string | null;
  stock: number | null;
  min_stock: number | null;
  outlet: string | null;
  sell_price: number | null;
  image: string | null;
  created_at: string;
  modified_at: string;
  details: ProductDetail[];
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function getProducts(outlet?: string): Promise<Product[]> {
  const url = outlet
    ? `${BASE_URL}/api/products?outlet=${encodeURIComponent(outlet)}`
    : `${BASE_URL}/api/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<Product[]> = await res.json();
  if (!json.success) throw new Error('Failed to fetch products');
  return json.data;
}

export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<Product> = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to fetch product');
  return json.data;
}

export async function createProduct(payload: {
  code?: string;
  name?: string;
  stock?: number;
  min_stock?: number;
  outlet?: string;
  sell_price?: number;
  image?: string;
  details?: { raw_id: string; unit?: string; conversion?: number }[];
}): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<Product> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

export async function updateProduct(id: string, payload: {
  code?: string;
  name?: string;
  stock?: number;
  min_stock?: number;
  outlet?: string;
  sell_price?: number;
  image?: string;
  details?: { raw_id: string; unit?: string; conversion?: number }[];
}): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<Product> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, { method: 'DELETE' });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
}

export type ProductOutlet = {
  id: string;
  code: string | null;
  name: string | null;
  stock: number | null;
  min_stock: number | null;
  outlet: string | null;
  sell_price: number | null;
  image: string | null;
  created_at: string;
  modified_at: string;
};

export async function bulkUpdateProductOutletStock(
  items: { id: string; stock: number; outlet: string }[]
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/product-outlets/bulk-stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`);
}

export async function getProductOutlets(outlet?: string): Promise<ProductOutlet[]> {
  const url = outlet
    ? `${BASE_URL}/api/product-outlets?outlet=${encodeURIComponent(outlet)}`
    : `${BASE_URL}/api/product-outlets`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<ProductOutlet[]> = await res.json();
  if (!json.success) throw new Error('Failed to fetch product outlets');
  return json.data;
}

export async function getProductOutletById(id: string): Promise<ProductOutlet> {
  const res = await fetch(`${BASE_URL}/api/product-outlets/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<ProductOutlet> = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to fetch product outlet');
  return json.data;
}
