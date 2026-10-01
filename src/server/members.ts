import 'server-only';
import { collections } from './mongodb';

export async function findMemberByEmail(email: string) {
  const c = await collections();
  return c.members.findOne({ email: email.trim().toLowerCase() });
}
