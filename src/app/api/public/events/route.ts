import { getPublicData } from '@/server/queries';

// 公開、唯讀：給其他網站（例如 National Games）抓賽事日期列表。
// 只回傳「已發布」賽事的公開欄位，不含提交者、審核狀態等內部資料。
export async function GET() {
  const { events } = await getPublicData();
  const body = events.map((e) => ({
    id: e.id,
    name: e.name,
    sportName: e.sportName,
    startDate: e.startDate,
    endDate: e.endDate,
    county: e.county,
    location: e.location,
    officialUrl: e.officialUrl,
    url: `https://event-board-one.vercel.app/events/${e.id}`,
  }));
  return Response.json(body, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } });
}
