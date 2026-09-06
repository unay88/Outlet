import { BASE_URL } from './index';

export async function getParameter(key: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/parameters/${key}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // response: { success: true, data: ["Pcs","Ekor",...] }
  if (!json.success) throw new Error(json.message ?? 'Failed to fetch parameter');
  return json.data;
}
