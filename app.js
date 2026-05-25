// 90PLUS ESM Entry Point
import { loadNews } from './js/api.js';
import { 
    setupTabNavigation, 
    renderTopNav, 
    setupSearch, 
    setupBottomSheet, 
    renderMainContent 
} from './js/ui.js';

// Application Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 1. UI 핵심 이벤트 리스너 등록
    setupTabNavigation();
    setupSearch();
    setupBottomSheet();
    
    // 2. 초기 탑 네비 및 본문 스켈레톤 마운트
    renderTopNav();
    renderMainContent();
    
    // 3. Supabase 및 로컬 데이터 비동기 Fetch
    try {
        await loadNews();
        // 4. 데이터 로드 완료 후 리렌더링
        renderTopNav();
        renderMainContent();
    } catch (err) {
        console.error("뉴스 데이터를 로드하는 중 오류가 발생했습니다:", err);
    }
});
