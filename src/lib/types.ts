// Shapes sent from the server to the browser (ids are MongoDB ObjectId hex strings).

export type ReviewStatus = '已發布' | '待審核' | '退回修正';
export type EventStatus = '即將舉行' | '進行中' | '已結束';

export type EventItem = {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
  sportColor: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  schoolLevels: string[];
  ageGroup: string;
  gender: string;
  tier: string;
  county: string;
  location: string;
  note: string;
  officialUrl: string;
  qualifiesForId: string;
  important: boolean;
  reviewStatus: ReviewStatus;
  submittedBy: string;
  createdAt: string; // ISO
};

export type Sport = { id: string; name: string; color: string; group: string; sourceId: string; sourceName: string };
export type Source = { id: string; name: string; url: string; announceUrl: string; format: string; difficulty: string; note: string; lastChecked: string; lastFound: string };
export type Member = { id: string; name: string; email: string; role: string; status: string };
export type ChangeLogEntry = { id: string; time: string; actor: string; actionType: string; table: string; note: string };
export type ReportStatus = '未處理' | '已處理';
export type ErrorReport = { id: string; time: string; eventId: string; eventName: string; content: string; status: ReportStatus; processedAt: string; processedBy: string };
export type SortBy = '依日期' | '依運動項目' | '依狀態';
export type ViewMode = '條列' | '行事曆';
export type SiteSettings = { showEnded: boolean; allowGuestReport: boolean; pinFeatured: boolean; sortBy: SortBy; viewMode: ViewMode };
