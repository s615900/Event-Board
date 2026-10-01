// One-time import of the old Ragic data (exported to JSON) into MongoDB.
//
//   node --env-file=.env.local scripts/migrate-from-ragic.mjs <ragic-export.json>
//
// Refuses to run if the events collection already has data, so it can't
// accidentally duplicate everything.
import { readFileSync } from 'node:fs';
import { MongoClient, ObjectId } from 'mongodb';

const COUNTIES = ['基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣',
  '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣'];
const SCHOOL_LEVELS = ['國小', '國中', '高中'];
const DIFFICULTY = { 容易: '低', 中等: '中', 困難: '高' };

const file = process.argv[2];
const { MONGODB_URI, MONGODB_DB } = process.env;
if (!file) { console.error('請指定匯出的 JSON 檔'); process.exit(1); }
if (!MONGODB_URI || !MONGODB_DB || MONGODB_DB === 'qsprint') { console.error('MONGODB_URI / MONGODB_DB 設定不正確'); process.exit(1); }

const data = JSON.parse(readFileSync(file, 'utf8'));
const isoDate = (v) => (v ? v.replaceAll('/', '-').slice(0, 10) : '');
// "2026/08/22 22:48:21" is Taiwan time.
const taipeiTime = (v) => (v ? new Date(`${v.replaceAll('/', '-').replace(' ', 'T')}+08:00`) : null);

// Only fill 縣市 when exactly one county name appears in the location text.
function guessCounty(location) {
  const text = location.replaceAll('台', '臺');
  const full = COUNTIES.filter((c) => text.includes(c));
  if (full.length) return full.length === 1 ? full[0] : '';
  // Short forms like 「高雄」 — only when the two characters identify one county.
  const short = COUNTIES.filter((c) => text.includes(c.slice(0, 2)));
  return short.length === 1 ? short[0] : '';
}
function guessTier(name) {
  if (/亞洲|國際|世界/.test(name)) return '國際';
  if (name.includes('全國')) return '全國';
  return '';
}

const client = new MongoClient(MONGODB_URI);
const notes = [];
try {
  await client.connect();
  const db = client.db(MONGODB_DB);
  if (await db.collection('events').countDocuments()) {
    console.error(`資料庫 ${MONGODB_DB} 已經有賽事資料，為避免重複，停止匯入。`);
    process.exit(1);
  }

  const sourceIds = new Map();
  for (const s of data.sources) {
    const _id = new ObjectId();
    sourceIds.set(s['協會名稱'], _id);
    await db.collection('sources').insertOne({
      _id, name: s['協會名稱'], url: s['官網首頁網址'], announceUrl: s['賽事公告頁面網址'], format: s['資料格式'],
      difficulty: DIFFICULTY[s['查詢難易度']] ?? '中', note: s['備註'], lastChecked: isoDate(s['上次查詢日期']), lastFound: isoDate(s['上次查到新資料日期']),
    });
  }

  const sportIds = new Map();
  for (const s of data.sports) {
    const _id = new ObjectId();
    sportIds.set(s['項目名稱'], _id);
    await db.collection('sports').insertOne({ _id, name: s['項目名稱'], color: s['顏色代碼'], group: s['分類'], sourceId: sourceIds.get(s['對應資料來源']) ?? null });
  }

  const eventIds = new Map(); // Ragic record id → new ObjectId
  const now = new Date();
  for (const e of data.events) {
    const _id = new ObjectId();
    eventIds.set(String(e.id), _id);
    const groups = e['組別'] ?? [];
    const others = groups.filter((g) => !SCHOOL_LEVELS.includes(g));
    const county = guessCounty(e['地點']);
    const tier = guessTier(e['賽事名稱']);
    if (others.length) notes.push(`「${e['賽事名稱']}」組別「${others.join('、')}」不是學制，已放進「年齡組」欄位`);
    await db.collection('events').insertOne({
      _id,
      name: e['賽事名稱'],
      sportId: sportIds.get(e['運動項目']) ?? null,
      startDate: isoDate(e['開始日期']),
      endDate: isoDate(e['結束日期']) || isoDate(e['開始日期']),
      schoolLevels: SCHOOL_LEVELS.filter((l) => groups.includes(l)),
      ageGroup: others.join('、'),
      gender: '',
      tier,
      county,
      location: e['地點'],
      note: e['備註'],
      officialUrl: e['資料來源網址'],
      qualifiesForId: null,
      important: e['重點賽事'] === '是',
      reviewStatus: e['審核狀態'] || '待審核',
      submittedBy: e['提交者'],
      createdAt: taipeiTime(e['建立時間']) ?? now,
      updatedAt: now,
    });
  }

  for (const m of data.members) {
    const email = m['Email'].trim().toLowerCase();
    await db.collection('members').updateOne(
      { email },
      { $set: { name: m['姓名'], role: m['角色'], status: m['狀態'] }, $setOnInsert: { _id: new ObjectId(), email } },
      { upsert: true },
    );
  }

  const s = data.settings;
  await db.collection('settings').updateOne({ _id: 'site' }, { $set: {
    showEnded: s['顯示已結束賽事'] === '是', allowGuestReport: s['開放訪客回報錯誤'] === '是', pinFeatured: s['重點賽事置頂'] === '是',
    sortBy: s['預設排序方式'] || '依日期', viewMode: s['預設檢視模式'] || '條列',
  } }, { upsert: true });

  for (const r of data.reports) {
    const eventId = eventIds.get(String(r['賽事ID']));
    await db.collection('reports').insertOne({
      _id: new ObjectId(), time: taipeiTime(r['時間']), eventId: eventId ? eventId.toHexString() : '', eventName: r['賽事名稱'],
      content: r['回報內容'], status: r['處理狀態'], processedAt: taipeiTime(r['處理時間']), processedBy: r['處理人'],
    });
  }

  if (data.changelog.length) {
    await db.collection('changelog').insertMany(data.changelog.map(([time, actor, actionType, table, note]) => ({
      _id: new ObjectId(), time: taipeiTime(time), actor, actionType, table, note,
    })));
  }

  const counts = {};
  for (const c of ['sources', 'sports', 'events', 'members', 'reports', 'changelog', 'settings']) counts[c] = await db.collection(c).countDocuments();
  console.log(`✓ 匯入完成（資料庫：${MONGODB_DB}）`, counts);
  for (const n of notes) console.log('  ・' + n);
} finally {
  await client.close();
}
