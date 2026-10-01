export type EventStatus = '報名中' | '即將報名' | '已截止' | '已結束';
export type ReviewStatus = '已發布' | '待審核' | '退回修正';
export type EventItem = { id: string; name: string; sportName: string; startdate: string; enddate: string; status: EventStatus; level: string; location: string; note: string; source: string; important: boolean; reviewStatus: ReviewStatus; submitterName: string; createdAt: string };
export type Source = { id: string; name: string; url: string; announceurl: string; format: string; difficulty: string; note: string; lastChecked: string; lastFound: string };
export type Sport = { id: string; name: string; color: string; group: string; sourceName: string };
export type Member = { id: string; name: string; email: string; role: string; status: string };
export type ChangeLogEntry = { id: string; time: string; actor: string; actionType: string; table: string; note: string };
export type ReportStatus = '未處理' | '已處理';
export type ErrorReport = { id: string; time: string; eventId: string; eventName: string; content: string; status: ReportStatus; processedAt: string; processedBy: string };
export type SortBy = '依日期' | '依運動項目' | '依狀態';
export type ViewMode = '條列' | '行事曆';
export type SiteSettings = { id: string; name: string; showEnded: boolean; allowGuestReport: boolean; pinFeatured: boolean; sortBy: SortBy; viewMode: ViewMode };

export type Setter<T> = (value: T | ((old: T) => T)) => void;
