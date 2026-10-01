import 'server-only';
import { insertRagicRecord, toRagicDateTime } from './ragic';
import { logger } from './logger';
import { sheetConfig } from './ragic-respond';

export const CHANGELOG_FIELD = {
  time: '1001366', // 時間
  actor: '1001367', // 操作者
  actionType: '1001368', // 動作類型
  table: '1001369', // 影響資料表
  note: '1001370', // 說明
};

export type ChangeActionType = '新增' | '編輯' | '刪除' | '核准發布' | '退回審核' | '下架';
export type ChangeTable = '資料來源' | '運動項目' | '賽事清單' | '成員' | '前台設定';

export function changelogConfig() {
  return sheetConfig('RAGIC_CHANGELOG_URL');
}

export function buildChangelogFields(actor: string, actionType: string, table: string, note: string) {
  return {
    [CHANGELOG_FIELD.time]: toRagicDateTime(new Date()),
    [CHANGELOG_FIELD.actor]: actor,
    [CHANGELOG_FIELD.actionType]: actionType,
    [CHANGELOG_FIELD.table]: table,
    [CHANGELOG_FIELD.note]: note,
  };
}

// Writes one changelog entry after a mutation on one of the managed sheets has
// already succeeded. Never throws — a changelog write failure must never fail
// the mutation it's describing. Unlike the Express version this is awaited by
// the route handler, since serverless runtimes may freeze after the response.
export async function logChange(
  actor: string,
  actionType: ChangeActionType,
  table: ChangeTable,
  note: string,
): Promise<void> {
  const { sheetUrl, apiKey } = changelogConfig();
  if (!sheetUrl || !apiKey) {
    logger.error('RAGIC_CHANGELOG_URL is not configured; skipping changelog entry');
    return;
  }
  try {
    const res = await insertRagicRecord(sheetUrl, apiKey, buildChangelogFields(actor, actionType, table, note));
    if (!res.ok) {
      logger.error({ status: res.status }, 'Failed to write changelog entry to Ragic');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to reach Ragic while writing changelog entry');
  }
}
