import 'server-only';
import { fetchRagicSheet } from './ragic';

export interface RagicMember {
  name: string;
  email: string;
  role: string;
  status: string;
}

export async function findMemberByEmail(email: string): Promise<RagicMember | null> {
  const sheetUrl = process.env['RAGIC_MEMBERS_URL'];
  const apiKey = process.env['RAGIC_API_KEY'];
  if (!sheetUrl || !apiKey) {
    throw new Error('RAGIC_MEMBERS_URL is not configured');
  }
  const res = await fetchRagicSheet(sheetUrl, apiKey);
  if (!res.ok) {
    throw new Error(`Failed to fetch members from Ragic: ${res.status}`);
  }
  const json = (await res.json()) as Record<string, Record<string, unknown>>;
  const target = email.trim().toLowerCase();
  for (const record of Object.values(json)) {
    const recordEmail = String(record['Email'] ?? '').trim().toLowerCase();
    if (recordEmail && recordEmail === target) {
      return {
        name: String(record['姓名'] ?? ''),
        email: recordEmail,
        role: String(record['角色'] ?? ''),
        status: String(record['狀態'] ?? ''),
      };
    }
  }
  return null;
}
