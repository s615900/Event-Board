// Prepares the sports_board database: indexes, default site settings and the
// first admin account. Safe to run more than once.
//
//   npm run db:init -- admin@example.com
//
// Reads MONGODB_URI / MONGODB_DB from .env.local.
import { MongoClient, ObjectId } from 'mongodb';

const adminEmail = (process.argv[2] ?? '').trim().toLowerCase();
const { MONGODB_URI, MONGODB_DB } = process.env;

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('缺少 MONGODB_URI 或 MONGODB_DB，請確認 .env.local');
  process.exit(1);
}
if (MONGODB_DB === 'qsprint') {
  console.error('MONGODB_DB 不能是 qsprint（那是另一個網站的資料庫）');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
  console.error('請在指令後面加上第一位管理者的 Email，例如：npm run db:init -- admin@example.com');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
try {
  await client.connect();
  const db = client.db(MONGODB_DB);

  await Promise.all([
    db.collection('members').createIndex({ email: 1 }, { unique: true }),
    db.collection('sports').createIndex({ name: 1 }, { unique: true }),
    db.collection('events').createIndex({ reviewStatus: 1, startDate: 1 }),
    db.collection('events').createIndex({ qualifiesForId: 1 }),
    db.collection('events').createIndex({ sportId: 1 }),
    db.collection('changelog').createIndex({ time: -1 }),
    db.collection('reports').createIndex({ time: -1 }),
  ]);
  console.log('✓ 索引已建立');

  await db.collection('settings').updateOne(
    { _id: 'site' },
    { $setOnInsert: { showEnded: false, allowGuestReport: false, pinFeatured: true, sortBy: '依日期', viewMode: '條列' } },
    { upsert: true },
  );
  console.log('✓ 前台設定已就緒');

  const existing = await db.collection('members').findOne({ email: adminEmail });
  if (existing) {
    await db.collection('members').updateOne({ _id: existing._id }, { $set: { role: '管理者', status: '啟用' } });
    console.log(`✓ ${adminEmail} 已經在名冊中，已確認為啟用中的管理者`);
  } else {
    await db.collection('members').insertOne({ _id: new ObjectId(), name: '管理者', email: adminEmail, role: '管理者', status: '啟用' });
    console.log(`✓ 已新增第一位管理者：${adminEmail}`);
  }
  console.log(`完成（資料庫：${MONGODB_DB}）`);
} finally {
  await client.close();
}
