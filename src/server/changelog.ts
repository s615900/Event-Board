import 'server-only';
import { ObjectId } from 'mongodb';
import { collections } from './mongodb';
import { logger } from './logger';

export type ChangeActionType = '新增' | '編輯' | '刪除' | '核准發布' | '退回審核' | '下架';
export type ChangeTable = '資料來源' | '運動項目' | '賽事清單' | '成員' | '前台設定';

// Records one entry after a mutation has already succeeded. Never throws — a
// changelog failure must not fail the change it describes.
export async function logChange(actor: string, actionType: ChangeActionType, table: ChangeTable, note: string): Promise<void> {
  try {
    const c = await collections();
    await c.changelog.insertOne({ _id: new ObjectId(), time: new Date(), actor, actionType, table, note });
  } catch (err) {
    logger.error({ err }, 'Failed to write changelog entry');
  }
}
