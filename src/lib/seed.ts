import type { EventItem, Member, SiteSettings, Source, Sport } from './types';

// Demo data shown until the Ragic-backed API responds (or when it isn't configured).
export const seedEvents: EventItem[] = [
  { id: 'e1', name: '2025 臺北城市馬拉松', sportName: '路跑', startdate: '2025-12-14', enddate: '2025-12-14', status: '報名中', level: '公開組', location: '臺北市中正紀念堂', note: '城市路線，全程與半程組別皆開放報名。', source: '臺北市體育局', important: true, reviewStatus: '已發布', submitterName: '系統整理', createdAt: '2025-08-21' },
  { id: 'e2', name: '114 年全國中等學校運動會', sportName: '田徑', startdate: '2026-04-18', enddate: '2026-04-23', status: '即將報名', level: '國高中', location: '新竹縣立體育場', note: '各縣市代表隊資格賽與正式賽事資訊。', source: '教育部體育署', important: true, reviewStatus: '已發布', submitterName: '系統整理', createdAt: '2025-09-02' },
  { id: 'e3', name: '2025 福爾摩沙鐵人三項', sportName: '鐵人三項', startdate: '2025-11-02', enddate: '2025-11-02', status: '報名中', level: '分齡組', location: '臺東森林公園', note: '標準距離與接力組，東海岸年度經典賽事。', source: '中華民國鐵人三項運動協會', important: false, reviewStatus: '已發布', submitterName: '林教練', createdAt: '2025-08-18' },
  { id: 'e4', name: '臺灣青少年羽球公開賽', sportName: '羽球', startdate: '2025-10-04', enddate: '2025-10-06', status: '報名中', level: 'U13–U19', location: '高雄巨蛋', note: '單打、雙打與混合雙打，採分級賽制。', source: '中華民國羽球協會', important: false, reviewStatus: '已發布', submitterName: '系統整理', createdAt: '2025-08-11' },
  { id: 'e5', name: '全國大專院校游泳錦標賽', sportName: '游泳', startdate: '2025-12-05', enddate: '2025-12-07', status: '即將報名', level: '大專院校', location: '臺中市北區國民運動中心', note: '大專體總年度賽事，選手請依校隊資格報名。', source: '中華民國大專院校體育總會', important: false, reviewStatus: '待審核', submitterName: '王小明', createdAt: '2025-09-10' },
  { id: 'e6', name: '新北市青少年籃球聯賽', sportName: '籃球', startdate: '2025-09-20', enddate: '2025-10-26', status: '報名中', level: '國中組', location: '新北市板橋體育館', note: '採分區循環賽，歡迎學校及社團組隊。', source: '新北市體育總會', important: false, reviewStatus: '已發布', submitterName: '系統整理', createdAt: '2025-08-29' },
  { id: 'e7', name: '花蓮縣全國獨木舟錦標賽', sportName: '水域運動', startdate: '2025-08-16', enddate: '2025-08-17', status: '已結束', level: '公開組', location: '花蓮溪出海口', note: '本年度賽事已圓滿結束。', source: '花蓮縣政府', important: false, reviewStatus: '已發布', submitterName: '系統整理', createdAt: '2025-07-02' },
];

export const seedSources: Source[] = [
  { id: 's1', name: '教育部體育署', url: 'https://www.sa.gov.tw', announceurl: 'https://www.sa.gov.tw/PageContent?n=10', format: 'HTML', difficulty: '中', note: '全國性學校賽事主要來源', lastChecked: '2025-09-12', lastFound: '2025-09-10' },
  { id: 's2', name: '臺北市體育局', url: 'https://sports.gov.taipei', announceurl: 'https://sports.gov.taipei/News', format: 'HTML', difficulty: '低', note: '臺北市活動與場館資訊', lastChecked: '2025-09-12', lastFound: '2025-09-12' },
  { id: 's3', name: '中華民國羽球協會', url: 'https://www.ctb.org.tw', announceurl: 'https://www.ctb.org.tw/news', format: 'PDF', difficulty: '高', note: '協會賽事公告，需人工確認', lastChecked: '2025-09-11', lastFound: '2025-09-08' },
];

export const seedSports: Sport[] = [
  { id: 'sp1', name: '路跑', color: '#E9654D', group: '耐力運動', sourceName: '臺北市體育局' },
  { id: 'sp2', name: '田徑', color: '#087F8C', group: '耐力運動', sourceName: '教育部體育署' },
  { id: 'sp3', name: '羽球', color: '#D2A83E', group: '球類運動', sourceName: '中華民國羽球協會' },
  { id: 'sp4', name: '籃球', color: '#536B7A', group: '球類運動', sourceName: '新北市體育總會' },
  { id: 'sp5', name: '游泳', color: '#3E9CA8', group: '水域運動', sourceName: '中華民國大專院校體育總會' },
  { id: 'sp6', name: '鐵人三項', color: '#C54D50', group: '耐力運動', sourceName: '中華民國鐵人三項運動協會' },
  { id: 'sp7', name: '水域運動', color: '#487C9A', group: '水域運動', sourceName: '花蓮縣政府' },
];

export const seedMembers: Member[] = [
  { id: 'm1', name: '陳怡君', email: 'yijun.chen@example.tw', role: '管理員', status: '啟用' },
  { id: 'm2', name: '林志豪', email: 'coach.lin@example.tw', role: '編輯者', status: '啟用' },
  { id: 'm3', name: '王小明', email: 'ming.wang@example.tw', role: '審核者', status: '啟用' },
];

export const seedSettings: SiteSettings = { id: 'st1', name: '前台顯示控制', showEnded: false, allowGuestReport: false, pinFeatured: true, sortBy: '依日期', viewMode: '條列' };
