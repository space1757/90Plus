// Supabase Configuration
const supabaseUrl = 'https://ayxqmsdctmaehahvrmra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHFtc2RjdG1hZWhhaHZybXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDIyNzYsImV4cCI6MjA5NTI3ODI3Nn0.ff00_U_nJx4s-HBboLGoIJIUrNL1vtgHht3PAjJ2yyc';

// 브라우저 전역에 로드된 supabase 라이브러리를 사용합니다.
export const sbClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// App Global States
export const state = {
    currentTab: 'news',
    activeNewsCategory: '최신뉴스',
    newsData: [],
    bookmarkedIds: JSON.parse(localStorage.getItem('90plus_bookmarks') || '[]'),
    searchQuery: '',
    selectedDate: 25
};

// State Update Helper
export function updateState(key, val) {
    if (key in state) {
        state[key] = val;
    }
}
