import { BASE_URL } from './index';

export type StockMove = {
  id: string;
  type: string | null;
  product_id: string | null;
  product_name: string | null;
  move_type: string | null;
  ref_type: string | null;
  sup_id: string | null;
  qty_before: number | null;
  qty_change: number | null;
  qty_after: number | null;
  notes: string | null;
  created_at: string;
};

export type StockMoveProduct = {
  id: string;
  product_id: string | null;
  product_name: string | null;
  raw_id: string | null;
  raw_name: string | null;
  qty_before: number | null;
  qty_change: number | null;
  qty_after: number | null;
  move_type: string | null;
  notes: string | null;
  created_at: string;
};

type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function getStockMoves(page = 1, limit = 10): Promise<{ data: StockMove[]; hasMore: boolean }> {
  const res = await fetch(`${BASE_URL}/api/stock-moves?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: PaginatedResponse<StockMove> = await res.json();
  if (!json.success) throw new Error('Failed to fetch stock moves');
  return { data: json.data, hasMore: page < json.meta.totalPages };
}

export async function getStockMoveProducts(page = 1, limit = 10): Promise<{ data: StockMoveProduct[]; hasMore: boolean }> {
  const res = await fetch(`${BASE_URL}/api/stock-move-products?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: PaginatedResponse<StockMoveProduct> = await res.json();
  if (!json.success) throw new Error('Failed to fetch stock move products');
  return { data: json.data, hasMore: page < json.meta.totalPages };
}
