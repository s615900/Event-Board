// Fixed choice lists shared by the admin forms, the API validation and the public filters.

export const SCHOOL_LEVELS = ['國小', '國中', '高中'] as const;
export const GENDERS = ['男', '女', '混合'] as const;
export const TIERS = ['校際', '縣市', '區域', '全國', '國際'] as const;
export const COUNTIES = [
  '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣',
  '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣',
] as const;
export const REVIEW_STATUSES = ['已發布', '待審核', '退回修正'] as const;
export const SPORT_GROUPS = ['陸上運動', '球類運動', '技擊運動', '水上運動', '冬季運動', '其他'] as const;
export const SOURCE_FORMATS = ['HTML', 'PDF', '圖片', '純文字', '結構化清單', 'JSON'] as const;
export const DIFFICULTIES = ['低', '中', '高'] as const;
export const ROLES = ['管理者', '編輯者', '檢視者'] as const;
export const MEMBER_STATUSES = ['啟用', '停用'] as const;
export const SORT_OPTIONS = ['依日期', '依運動項目', '依狀態'] as const;
export const VIEW_MODES = ['條列', '行事曆'] as const;
