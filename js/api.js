import { sbClient, state } from './config.js';
import { mockNews } from './mockData.js';

// Database Fetch & Parse News
export async function loadNews() {
    const feed = document.getElementById('tab-content');
    if (!feed) return;
    
    // Show Loading Skeleton
    feed.innerHTML = `
        <div class="flex flex-col gap-4">
            <div class="h-36 skeleton rounded-2xl"></div>
            <div class="h-44 skeleton rounded-2xl"></div>
        </div>
    `;

    if (!sbClient) {
        // Supabase가 연결되지 않은 경우 로컬 모크 데이터만 사용
        state.newsData = [...mockNews];
        return;
    }

    try {
        const { data, error } = await sbClient
            .from('football_news')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;

        const parsedDbNews = data.map(item => {
            let contentText = item.title || '';
            try {
                if (typeof contentText === 'string' && contentText.includes('"text"')) {
                    const parsed = JSON.parse(contentText);
                    contentText = parsed.parts[0].text;
                }
            } catch(e) {}

            let parsedJson = null;
            try {
                if (contentText.trim().startsWith('{')) {
                    parsedJson = JSON.parse(contentText);
                }
            } catch(e) {}

            let title = parsedJson?.title || contentText.substring(0, 45) + "...";
            let content = parsedJson?.content || contentText;
            let reporter = parsedJson?.reporter || item.reporter || "BBC Sports";
            let tier = parsedJson?.tier || item.tier || 3;
            let isHereWeGo = parsedJson?.is_here_we_go || item.is_here_we_go || false;
            let category = parsedJson?.category || item.category || "최신뉴스";
            let summaryPoints = parsedJson?.summary || [];
            let tacticGrade = parsedJson?.tactic_grade || null;

            if (!parsedJson) {
                if (contentText.includes("살라")) {
                    title = "모하메드 살라, 미천한 시골 소년에서 리버풀의 국가적 영웅이 되기까지";
                    category = "최신뉴스";
                    summaryPoints = [
                        "BBC 스포츠가 이집트 리버풀 영웅 살라의 고향 다큐 추적.",
                        "미천한 시골 소년에서 안필드 아이콘이 된 성공 비결 조명."
                    ];
                } else if (contentText.includes("다비즈")) {
                    title = "에드가 다비즈, 반즐리 FC 시절 전술 및 감독 커리어 회고";
                    category = "전술분석";
                    tacticGrade = { managerA: { name: "에드가 다비즈", grade: "B+" }, managerB: { name: "반즐리 전술진", grade: "B-" } };
                }
            }

            return {
                id: item.id,
                created_at: item.created_at,
                title, content, reporter, tier,
                is_here_we_go: isHereWeGo,
                category,
                summary_points: summaryPoints,
                tactic_grade,
                tactic_summary: tacticGrade ? "🏆 가변 3-4-3 빌드업" : null
            };
        });

        // 로컬 모크 데이터와 Supabase 데이터 통합
        const mergedNews = [...mockNews, ...parsedDbNews];
        
        // 기사 중복 제거 (본문 앞부분 30글자 기준)
        const uniqueMap = new Map();
        mergedNews.forEach(item => {
            const key = item.content.substring(0, 30);
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });
        
        state.newsData = Array.from(uniqueMap.values());
        // 시간순 내림차순 정렬
        state.newsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
    } catch (err) {
        console.error(err);
        feed.innerHTML = `
            <div class="text-center py-10 bg-cardbg rounded-2xl p-6">
                <p class="text-white">데이터 로드 실패: ${err.message}</p>
            </div>
        `;
        throw err;
    }
}
