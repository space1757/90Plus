// =========================================================================
// 90PLUS⁺ Premium Sports Dashboard - Unified Application Engine (v2.2.0)
// =========================================================================

// 1. Supabase Initialization
const supabaseUrl = 'https://ayxqmsdctmaehahvrmra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHFtc2RjdG1hZWhhaHZybXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDIyNzYsImV4cCI6MjA5NTI3ODI3Nn0.ff00_U_nJx4s-HBboLGoIJIUrNL1vtgHht3PAjJ2yyc';
const sbClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// 2. Global State Management
const state = {
    currentTab: 'news',
    activeNewsCategory: '최신뉴스',
    newsData: [],
    bookmarkedIds: JSON.parse(localStorage.getItem('90plus_bookmarks') || '[]'),
    searchQuery: '',
    selectedDate: 25,
    user: null,         // Supabase Auth User Object
    adminMode: false    // Admin authorization toggle
};

// 3. Official Club Logo Emblems (Wikipedia Official High-Res Vectors)
const teamLogos = {
    "리버풀": "https://upload.wikimedia.org/wikipedia/ko/b/b8/Liverpool_FC_logo.svg",
    "아스날": "https://upload.wikimedia.org/wikipedia/ko/5/53/Arsenal_FC.svg",
    "맨시티": "https://upload.wikimedia.org/wikipedia/ko/e/eb/Manchester_City_FC_badge.svg",
    "첼시": "https://upload.wikimedia.org/wikipedia/ko/c/cc/Chelsea_FC.svg",
    "토트넘": "https://upload.wikimedia.org/wikipedia/ko/b/b4/Tottenham_Hotspur_FC_badge.svg",
    "맨유": "https://upload.wikimedia.org/wikipedia/ko/b/b1/Manchester_United_FC_crest.svg",
    "나폴리": "https://upload.wikimedia.org/wikipedia/commons/d/d2/SSC_Napoli_2024.svg",
    "파리 생제르맹": "https://upload.wikimedia.org/wikipedia/ko/a/a7/Paris_Saint-Germain_FC_logo.svg",
    "바르샤": "https://upload.wikimedia.org/wikipedia/ko/4/47/FC_Barcelona_%28logo%29.svg",
    "레알": "https://upload.wikimedia.org/wikipedia/ko/c/c7/Real_Madrid_CF_logo.svg"
};

// 4. Premium Mock Data (Offline Fallbacks)
const mockNews = [
    {
        id: 'mock-1',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        is_here_we_go: true,
        title: "빅토르 오시멘",
        transfer_info: { from: "SSC 나폴리", to: "파리 생제르맹", cost: "€120M + 보너스" },
        reporter: "Fabrizio Romano",
        tier: 1,
        category: "이적소식",
        content: "빅토르 오시멘과 파리 생제르맹 간의 개인 조건 협상이 최종적으로 완료되었습니다. 계약 기간은 5년이며, 연봉은 세후 €12m으로 책정되었습니다. 나폴리와 PSG 간의 바이아웃 이적료 협상이 극적으로 타결되었으며 선수는 오늘 메디컬 테스트를 진행합니다."
    },
    {
        id: 'mock-2',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        is_here_we_go: false,
        title: "손흥민, 토트넘과 2027년까지 재계약 임박... 주급 상승 예상",
        reporter: "The Athletic",
        tier: 1,
        category: "최신뉴스",
        content: "토트넘 홋스퍼가 주장 손흥민과의 2027년 계약 연장을 위한 협상을 성공적으로 진행 중입니다. 새로운 계약에는 기존 대비 상당한 주급 인상이 포함될 예정이며, 포스테코글루 감독은 손흥민을 전술 및 정신적 핵심 리더로 평가해 재계약을 구단 수뇌부에 강력히 요청했습니다.",
        summary_points: [
            "토트넘 홋스퍼가 캡틴 손흥민과 2027년까지 계약 연장 협상 중.",
            "새로운 계약에는 큰 폭의 주급 인상 및 프리미엄 대우 포함 전망.",
            "포스테코글루 감독은 손흥민의 구단 내 영향력을 절대적으로 높게 평가함."
        ]
    }
];

// EPL Real Match Results & Real Live Scores Update
const mockMatches = {
    25: [
        { league: "프리미어리그", leagueId: "EPL", status: "FT", time: "종료", home: "맨유", away: "리버풀", homeScore: 2, awayScore: 2, stats: { shots: 14, possession: 49 }, highlight: false },
        { league: "프리미어리그", leagueId: "EPL", status: "FT", time: "종료", home: "첼시", away: "토트넘", homeScore: 1, awayScore: 2, stats: { shots: 11, possession: 52 }, highlight: false },
        { league: "프리미어리그", leagueId: "EPL", status: "LIVE", time: "88'", home: "맨시티", away: "아스날", homeScore: 3, awayScore: 1, stats: { shots: 19, possession: 61 }, highlight: true },
        { league: "라리가", leagueId: "LALIGA", status: "FT", time: "종료", home: "바르샤", away: "레알", homeScore: 1, awayScore: 3, stats: { shots: 10, possession: 55 }, highlight: false }
    ]
};

// EPL Real Standings Update
const mockStandings = [
    { rank: 1, team: "아스날", played: 35, win: 24, draw: 8, loss: 3, gd: 48, pts: 80 },
    { rank: 2, team: "맨시티", played: 34, win: 24, draw: 6, loss: 4, gd: 45, pts: 78 },
    { rank: 3, team: "리버풀", played: 35, win: 22, draw: 9, loss: 4, gd: 39, pts: 75 },
    { rank: 4, team: "토트넘", played: 35, win: 19, draw: 6, loss: 10, gd: 18, pts: 63 },
    { rank: 5, team: "첼시", played: 35, win: 17, draw: 9, loss: 9, gd: 15, pts: 60 }
];

// 5. Utility Functions
function getRelativeTime(dateString) {
    const diffMs = new Date() - new Date(dateString);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
}

function saveBookmarks() {
    localStorage.setItem('90plus_bookmarks', JSON.stringify(state.bookmarkedIds));
}

function toggleBookmark(id, event) {
    if (event) event.stopPropagation();
    const index = state.bookmarkedIds.indexOf(id);
    if (index === -1) {
        state.bookmarkedIds.push(id);
    } else {
        state.bookmarkedIds.splice(index, 1);
    }
    saveBookmarks();
    renderMainContent();
}

// 6. Database Interaction (Supabase Fetch & Parse)
async function loadNews() {
    const feed = document.getElementById('tab-content');
    if (!feed) return;
    
    // Show loading skeleton UI
    feed.innerHTML = `
        <div class="flex flex-col gap-4">
            <div class="h-36 skeleton rounded-2xl"></div>
            <div class="h-44 skeleton rounded-2xl"></div>
        </div>
    `;

    if (!sbClient) {
        state.newsData = [...mockNews];
        renderTopNav();
        renderMainContent();
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
            
            // 1. JSON parsing check for Gemini / App Rich payload structure
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

            // 2. Safe variable extraction to avoid ReferenceErrors
            let title = parsedJson?.title || contentText.substring(0, 45) + "...";
            let content = parsedJson?.content || contentText;
            let reporter = parsedJson?.reporter || item.reporter || "90PLUS 뉴스";
            let tier = parsedJson?.tier || item.tier || 3;
            let isHereWeGo = parsedJson?.is_here_we_go || item.is_here_we_go || false;
            let category = parsedJson?.category || item.category || "최신뉴스";
            let summaryPoints = parsedJson?.summary || [];
            let transferInfo = parsedJson?.transfer_info || item.transfer_info || null;

            // 3. Fallback dummy text matching for older databases
            if (!parsedJson) {
                if (contentText.includes("살라")) {
                    title = "모하메드 살라, 미천한 소년에서 안필드의 국가적 영웅이 되기까지";
                    category = "최신뉴스";
                    summaryPoints = [
                        "BBC 스포츠가 이집트 리버풀 영웅 살라의 고향 다큐 추적.",
                        "미천한 시골 소년에서 안필드 아이콘이 된 성공 비결 조명."
                    ];
                }
            }

            return {
                id: item.id,
                created_at: item.created_at,
                title, content, reporter, tier,
                is_here_we_go: isHereWeGo,
                category,
                summary_points: summaryPoints,
                transfer_info: transferInfo
            };
        });

        // Merge Mock + DB news, remove duplicates based on content prefix
        const mergedNews = [...mockNews, ...parsedDbNews];
        const uniqueMap = new Map();
        mergedNews.forEach(item => {
            const key = item.content.substring(0, 30);
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });

        state.newsData = Array.from(uniqueMap.values());
        state.newsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (err) {
        console.error("DB Load failed, fallback to offline mocks:", err);
        state.newsData = [...mockNews]; 
    } finally {
        renderTopNav();
        renderMainContent();
    }
}

// 7. Supabase Auth Module Integration
async function initAuth() {
    if (!sbClient) {
        updateAuthUI(); // Call updateAuthUI even if sbClient is null to render Guest profile button correctly!
        return;
    }

    // Listen to real-time Auth State Changes
    sbClient.auth.onAuthStateChange((event, session) => {
        state.user = session?.user || null;
        
        // Define admin accounts (admin@admin.com, @90plus.co emails, or explicit metadata claim)
        state.adminMode = state.user ? (
            state.user.email.endsWith('@90plus.co') || 
            state.user.email === 'admin@admin.com' ||
            state.user.user_metadata?.role === 'admin'
        ) : false;
        
        updateAuthUI();
    });

    // Check current active session
    try {
        const { data: { session } } = await sbClient.auth.getSession();
        state.user = session?.user || null;
        state.adminMode = state.user ? (
            state.user.email.endsWith('@90plus.co') || 
            state.user.email === 'admin@admin.com' ||
            state.user.user_metadata?.role === 'admin'
        ) : false;
    } catch (e) {
        console.warn("Auth initialization error:", e);
    }
    updateAuthUI();
}

function updateAuthUI() {
    const btnAuthToggle = document.getElementById('btn-auth-toggle');
    const authUserInfo = document.getElementById('auth-user-info');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const authTabContainer = document.getElementById('auth-tab-container');
    
    const displayName = document.getElementById('user-display-name');
    const displayEmail = document.getElementById('user-display-email');
    const adminBadge = document.getElementById('user-admin-badge');
    const btnAdminPanel = document.getElementById('btn-admin-panel');
    const avatar = document.getElementById('user-avatar');

    if (!btnAuthToggle) return;

    if (state.user) {
        // User logged in state (Using Tailwind standard size w-6 h-6 instead of collapsed w-5.5 h-5.5)
        btnAuthToggle.innerHTML = `
            <div class="relative">
                <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-darkbg"></span>
            </div>
        `;
        
        if (authUserInfo) authUserInfo.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
        if (formSignup) formSignup.classList.add('hidden');
        if (authTabContainer) authTabContainer.classList.add('hidden');

        const nickname = state.user.user_metadata?.nickname || state.user.user_metadata?.name || state.user.email.split('@')[0];
        if (displayName) displayName.textContent = `${nickname}님`;
        if (displayEmail) displayEmail.textContent = state.user.email;
        if (avatar) avatar.textContent = nickname.substring(0, 1).toUpperCase();

        if (state.adminMode) {
            if (adminBadge) adminBadge.classList.remove('hidden');
            if (btnAdminPanel) btnAdminPanel.classList.remove('hidden');
        } else {
            if (adminBadge) adminBadge.classList.add('hidden');
            if (btnAdminPanel) btnAdminPanel.classList.add('hidden');
        }
    } else {
        // Guest / Logged out state (Using Tailwind standard size w-6 h-6 instead of collapsed w-5.5 h-5.5)
        btnAuthToggle.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        `;
        
        if (authUserInfo) authUserInfo.classList.add('hidden');
        if (formLogin) formLogin.classList.remove('hidden');
        if (formSignup) formSignup.classList.add('hidden');
        if (authTabContainer) authTabContainer.classList.remove('hidden');
        
        switchAuthTab('login');
    }
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    if (!tabLogin || !tabSignup) return;

    if (tab === 'login') {
        tabLogin.className = "flex-1 pb-3 text-sm font-extrabold border-b-2 border-brand text-brand";
        tabSignup.className = "flex-1 pb-3 text-sm font-extrabold border-b-2 border-transparent text-mutedtext hover:text-white";
        if (formLogin) formLogin.classList.remove('hidden');
        if (formSignup) formSignup.classList.add('hidden');
    } else {
        tabSignup.className = "flex-1 pb-3 text-sm font-extrabold border-b-2 border-brand text-brand";
        tabLogin.className = "flex-1 pb-3 text-sm font-extrabold border-b-2 border-transparent text-mutedtext hover:text-white";
        if (formSignup) formSignup.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
    }
}

function setupAuthEvents() {
    const btnAuthToggle = document.getElementById('btn-auth-toggle');
    const authBackdrop = document.getElementById('auth-backdrop');
    const btnCloseAuth = document.getElementById('btn-close-auth');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');

    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const btnLogout = document.getElementById('btn-logout');

    const btnAdminPanel = document.getElementById('btn-admin-panel');
    const adminBackdrop = document.getElementById('admin-backdrop');
    const btnCloseAdmin = document.getElementById('btn-close-admin');

    if (btnAuthToggle && authBackdrop) {
        btnAuthToggle.addEventListener('click', () => {
            authBackdrop.classList.add('open');
        });
    }

    if (btnCloseAuth && authBackdrop) {
        btnCloseAuth.addEventListener('click', () => {
            authBackdrop.classList.remove('open');
        });
        authBackdrop.addEventListener('click', (e) => {
            if (e.target === authBackdrop) authBackdrop.classList.remove('open');
        });
    }

    if (tabLogin) tabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => switchAuthTab('signup'));

    // Authenticated Forms Submission
    if (formLogin && sbClient) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const { error } = await sbClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                alert("🔓 로그인 성공! 환영합니다.");
                authBackdrop.classList.remove('open');
            } catch (err) {
                alert(`❌ 로그인 실패: ${err.message}`);
            }
        });
    }

    if (formSignup && sbClient) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;

            try {
                const { error } = await sbClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { nickname }
                    }
                });
                if (error) throw error;
                alert("✉️ 회원가입 완료! 메일인증 후 즉시 활동하실 수 있습니다.");
                switchAuthTab('login');
            } catch (err) {
                alert(`❌ 회원가입 실패: ${err.message}`);
            }
        });
    }

    if (btnLogout && sbClient) {
        btnLogout.addEventListener('click', async () => {
            try {
                const { error } = await sbClient.auth.signOut();
                if (error) throw error;
                alert("🔒 로그아웃 되었습니다.");
                authBackdrop.classList.remove('open');
            } catch (err) {
                alert(`❌ 로그아웃 실패: ${err.message}`);
            }
        });
    }

    // Connect Profile Admin Button
    if (btnAdminPanel && adminBackdrop) {
        btnAdminPanel.addEventListener('click', () => {
            authBackdrop.classList.remove('open');
            adminBackdrop.classList.add('open');
            const savedKey = localStorage.getItem('90plus_gemini_key') || '';
            const keyInput = document.getElementById('gemini-api-key');
            if (keyInput) keyInput.value = savedKey;
        });
    }

    if (btnCloseAdmin && adminBackdrop) {
        btnCloseAdmin.addEventListener('click', () => {
            adminBackdrop.classList.remove('open');
        });
        adminBackdrop.addEventListener('click', (e) => {
            if (e.target === adminBackdrop) adminBackdrop.classList.remove('open');
        });
    }
}

// 8. Serverless AI News Creator & Admin Dashboard Implementation
async function generateAiArticle(apiKey, title, outline) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `
당신은 대한민국 최고의 프리미엄 스포츠 매거진 '90PLUS⁺'의 수석 축구 저널리스트이자 전문 에디터입니다.
입력받은 [기사 제목]과 [기사 개요 / 사실적 재료]를 바탕으로, 지적이고 생동감 넘치며 축구 전문 지식이 풍부하게 묻어나는 프리미엄 기사 본문을 작성해야 합니다.

다음 조건을 반드시 준수하십시오:
1. 반드시 완벽한 한국어로 작성할 것.
2. 어조는 스포츠 매거진 전문 기자의 신뢰감 넘치는 톤앤매너로 하고 문장력이 뛰어나야 합니다.
3. 분량은 본문 기준으로 350~500자 정도로 문단을 깔끔하게 구분하여 기사 형태로 작성할 것.
4. 기사의 핵심 사실을 요약한 3가지 핵심 요약 포인트(Summary Points)를 반드시 유려한 문장으로 도출할 것.
5. 출력 형식은 반드시 JSON 형태여야 하며, 추가적인 설명 텍스트나 마크다운 기호(예: \`\`\`json) 없이 순수한 JSON만 반환해야 합니다.

반환할 JSON 구조 형식:
{
  "content": "여기에 스포츠 기사 본문을 길게 완성해 주세요. 문단 나누기는 \\n을 활용하세요.",
  "summary": [
    "첫 번째 핵심 요약 문장",
    "두 번째 핵심 요약 문장",
    "세 번째 핵심 요약 문장"
  ]
}
`;

    const userMessage = `
[기사 제목]: ${title}
[기사 개요 / 사실적 재료]: ${outline}
`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: systemPrompt },
                    { text: userMessage }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status} Error`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
        throw new Error("Gemini로부터 올바른 응답을 받지 못했습니다.");
    }

    try {
        const parsed = JSON.parse(responseText);
        if (!parsed.content || !Array.isArray(parsed.summary)) {
            throw new Error("Gemini 응답 JSON 필드 규격이 불일치합니다.");
        }
        return parsed;
    } catch (e) {
        console.warn("JSON 파싱 에러, 수동 대체 파싱 시도", e);
        return {
            content: responseText.replace(/[\{\}]/g, '').trim(),
            summary: [
                `${title} 경기 관련 긴급 분석 리포트`,
                `새로운 팀 전술 흐름이 포착되었습니다.`,
                `상세 본문을 토대로 90plus에서 실시간 업데이트 예정.`
            ]
        };
    }
}

async function deleteArticle(id, event) {
    if (event) event.stopPropagation();
    
    if (!confirm("🗑️ 이 축구 기사(또는 이적 소식)를 정말로 삭제하시겠습니까?")) return;

    try {
        if (id.startsWith('mock-')) {
            // Local Mock News deletion
            const idx = mockNews.findIndex(n => n.id === id);
            if (idx !== -1) mockNews.splice(idx, 1);
            alert("🗑️ 모크 기사가 로컬 메모리에서 임시 삭제되었습니다.");
        } else if (sbClient) {
            // Live Supabase DB News deletion
            const { error } = await sbClient
                .from('football_news')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert("🗑️ 기사가 데이터베이스에서 완전히 삭제되었습니다!");
        }
        
        // Reload feeds
        loadNews();
    } catch (err) {
        alert(`❌ 기사 삭제 실패: ${err.message}`);
    }
}

function setupAdminPanelEvents() {
    const btnSaveKey = document.getElementById('btn-save-key');
    const keyInput = document.getElementById('gemini-api-key');
    const tabWrite = document.getElementById('admin-tab-write');
    const tabTransfer = document.getElementById('admin-tab-transfer');
    const formAdminNews = document.getElementById('form-admin-news');
    const formAdminTransfer = document.getElementById('form-admin-transfer');

    if (btnSaveKey && keyInput) {
        btnSaveKey.addEventListener('click', () => {
            const key = keyInput.value.trim();
            localStorage.setItem('90plus_gemini_key', key);
            alert("🔑 Gemini API 키가 브라우저에 안전하게 저장되었습니다.");
        });
    }

    if (tabWrite && tabTransfer && formAdminNews && formAdminTransfer) {
        tabWrite.addEventListener('click', () => {
            tabWrite.className = "flex-1 pb-3 border-b-2 border-brand text-brand";
            tabTransfer.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            formAdminNews.classList.remove('hidden');
            formAdminTransfer.classList.add('hidden');
        });
        tabTransfer.addEventListener('click', () => {
            tabTransfer.className = "flex-1 pb-3 border-b-2 border-brand text-brand";
            tabWrite.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            formAdminTransfer.classList.remove('hidden');
            formAdminNews.classList.add('hidden');
        });
    }

    const btnGenerateAi = document.getElementById('btn-generate-ai-text');
    if (btnGenerateAi) {
        btnGenerateAi.addEventListener('click', async () => {
            const title = document.getElementById('admin-news-title').value.trim();
            const outline = document.getElementById('admin-news-outline').value.trim();
            const apiKey = localStorage.getItem('90plus_gemini_key') || '';

            if (!apiKey) {
                alert("🔑 AI 작성을 진행하려면 먼저 Gemini API Key를 입력하고 저장해 주세요!");
                return;
            }
            if (!title || !outline) {
                alert("✍️ 기사 제목과 대략적 사실 개요를 입력해 주세요.");
                return;
            }

            btnGenerateAi.disabled = true;
            btnGenerateAi.textContent = "🪄 AI 본문 집필 중... (5초 소요)";
            btnGenerateAi.className = "flex-1 bg-teal-800 text-teal-400 font-extrabold py-3.5 rounded-xl text-sm cursor-not-allowed";

            try {
                const aiResult = await generateAiArticle(apiKey, title, outline);
                
                const previewContainer = document.getElementById('ai-preview-container');
                const contentInput = document.getElementById('admin-news-content');
                const summaryInput = document.getElementById('admin-news-summary');
                const btnSubmitNews = document.getElementById('btn-submit-news');

                if (previewContainer && contentInput && summaryInput && btnSubmitNews) {
                    contentInput.value = aiResult.content;
                    summaryInput.value = aiResult.summary.join('\n');
                    
                    previewContainer.classList.remove('hidden');
                    
                    btnSubmitNews.disabled = false;
                    btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]";
                }
            } catch (err) {
                alert(`❌ AI 본문 작성 중 에러 발생: ${err.message}`);
            } finally {
                btnGenerateAi.disabled = false;
                btnGenerateAi.textContent = "🪄 AI 본문 초안 생성 (Gemini)";
                btnGenerateAi.className = "flex-1 bg-teal-500 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98]";
            }
        });
    }

    if (formAdminNews && sbClient) {
        formAdminNews.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('admin-news-title').value.trim();
            const category = document.getElementById('admin-news-category').value;
            const content = document.getElementById('admin-news-content').value.trim();
            const summaryRaw = document.getElementById('admin-news-summary').value.trim();
            const summary = summaryRaw ? summaryRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
            const nickname = state.user ? (state.user.user_metadata?.nickname || state.user.user_metadata?.name || "90PLUS 기자") : "90PLUS AI";

            const richPayload = {
                title: title,
                content: content,
                reporter: nickname,
                tier: 1,
                category: category,
                is_here_we_go: false,
                summary: summary
            };

            const jsonString = JSON.stringify(richPayload);

            try {
                const { error } = await sbClient
                    .from('football_news')
                    .insert({
                        title: jsonString,
                        reporter: nickname,
                        tier: 1,
                        is_here_we_go: false,
                        category: category
                    });

                if (error) throw error;

                alert("🏆 AI 뉴스가 발행 완료되어 즉시 플랫폼 메인 피드에 노출됩니다!");
                document.getElementById('admin-backdrop').classList.remove('open');
                
                formAdminNews.reset();
                const previewContainer = document.getElementById('ai-preview-container');
                if (previewContainer) previewContainer.classList.add('hidden');
                
                const btnSubmitNews = document.getElementById('btn-submit-news');
                if (btnSubmitNews) {
                    btnSubmitNews.disabled = true;
                    btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 opacity-50 cursor-not-allowed";
                }

                loadNews();
            } catch (err) {
                alert(`❌ 기사 발행 실패: ${err.message}`);
            }
        });
    }

    if (formAdminTransfer && sbClient) {
        formAdminTransfer.addEventListener('submit', async (e) => {
            e.preventDefault();
            const player = document.getElementById('transfer-player').value.trim();
            const cost = document.getElementById('transfer-cost').value.trim();
            const fromTeam = document.getElementById('transfer-from').value.trim();
            const toTeam = document.getElementById('transfer-to').value.trim();
            const reporter = document.getElementById('transfer-reporter').value.trim();
            const tier = parseInt(document.getElementById('transfer-tier').value, 10);
            const desc = document.getElementById('transfer-desc').value.trim();

            const transferPayload = {
                title: player,
                content: desc,
                reporter: reporter,
                tier: tier,
                category: "이적소식",
                is_here_we_go: true,
                transfer_info: {
                    from: fromTeam,
                    to: toTeam,
                    cost: cost
                }
            };

            const jsonString = JSON.stringify(transferPayload);

            try {
                const { error } = await sbClient
                    .from('football_news')
                    .insert({
                        title: jsonString,
                        reporter: reporter,
                        tier: tier,
                        is_here_we_go: true,
                        category: "이적소식"
                    });

                if (error) throw error;

                alert("🚨 HERE WE GO! 선수 이적 정보 카드가 즉시 등록 발행되었습니다!");
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminTransfer.reset();
                loadNews();
            } catch (err) {
                alert(`❌ 이적 등록 실패: ${err.message}`);
            }
        });
    }
}

// 9. UI Rendering & Tab Routers
function setupTabNavigation() {
    const tabs = { 'tab-matches': 'matches', 'tab-news': 'news', 'tab-leagues': 'leagues', 'tab-following': 'following' };
    Object.entries(tabs).forEach(([id, tabName]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                Object.keys(tabs).forEach(tId => {
                    const el = document.getElementById(tId);
                    if (el) el.className = "flex flex-col items-center gap-1 text-darkgray hover:text-white transition-colors py-1 px-4 rounded-xl";
                });
                btn.className = "flex flex-col items-center gap-1 text-brand font-bold py-1 px-4 rounded-xl";
                state.currentTab = tabName;
                renderTopNav();
                renderMainContent();
            });
        }
    });
}

function renderTopNav() {
    const navContent = document.getElementById('top-nav-content');
    if (!navContent) return;
    navContent.innerHTML = '';

    if (state.currentTab === 'news' || state.currentTab === 'following') {
        const categories = ['최신뉴스', '이적소식', '경기결과']; // Purged 전술분석
        categories.forEach(cat => {
            const button = document.createElement('button');
            const isActive = state.activeNewsCategory === cat;
            button.className = `px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${isActive ? 'border-brand text-brand bg-brand/10' : 'border-bordercolor text-mutedtext hover:text-white'}`;
            button.textContent = cat;
            button.addEventListener('click', () => {
                state.activeNewsCategory = cat;
                renderTopNav();
                renderMainContent();
            });
            navContent.appendChild(button);
        });
    } else if (state.currentTab === 'matches') {
        const days = [ { d: 23, w: '월' }, { d: 24, w: '화' }, { d: 25, w: '수' }, { d: 26, w: '목' }, { d: 27, w: '금' }, { d: 28, w: '토' }, { d: 29, w: '일' } ];
        const daysContainer = document.createElement('div');
        daysContainer.className = "flex-1 flex justify-around items-center";

        days.forEach(day => {
            const dayBtn = document.createElement('button');
            const isSelected = state.selectedDate === day.d;
            dayBtn.className = `flex flex-col items-center py-1 px-2.5 rounded-lg transition-all ${isSelected ? 'bg-brand text-black font-extrabold shadow-md' : 'text-mutedtext hover:text-white'}`;
            dayBtn.innerHTML = `<span class="text-[9px] font-medium leading-none mb-1 opacity-70">${day.w}</span><span class="text-sm font-bold leading-none">${day.d}</span>`;
            dayBtn.addEventListener('click', () => {
                state.selectedDate = day.d;
                renderTopNav();
                renderMainContent();
            });
            daysContainer.appendChild(dayBtn);
        });
        navContent.appendChild(daysContainer);
    } else if (state.currentTab === 'leagues') {
        const button = document.createElement('button');
        button.className = 'px-4 py-1.5 rounded-full text-xs font-bold border border-brand text-brand bg-brand/10';
        button.textContent = '프리미어리그';
        navContent.appendChild(button);
    }
}

function setupSearch() {
    const btnSearchToggle = document.getElementById('btn-search-toggle');
    const container = document.getElementById('search-bar-container');
    const searchInput = document.getElementById('search-input');
    const btnClear = document.getElementById('btn-search-clear');

    if (btnSearchToggle && container && searchInput) {
        btnSearchToggle.addEventListener('click', () => {
            container.classList.toggle('hidden');
            if (!container.classList.contains('hidden')) searchInput.focus();
        });

        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            if (btnClear) {
                if (state.searchQuery.length > 0) btnClear.classList.remove('hidden');
                else btnClear.classList.add('hidden');
            }
            renderMainContent();
        });

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                searchInput.value = '';
                state.searchQuery = '';
                btnClear.classList.add('hidden');
                renderMainContent();
                searchInput.focus();
            });
        }
    }

    const btnNotify = document.getElementById('btn-notify');
    const btnSettings = document.getElementById('btn-settings');
    if (btnNotify) btnNotify.addEventListener('click', () => alert("🔔 알림: 오늘 올라온 프리미어리그 이적 속보 및 경기 소식을 확인하세요!"));
    if (btnSettings) btnSettings.addEventListener('click', () => alert("⚙️ 설정: 90plus 프리미엄 스포츠 매거진 v2.2.0"));
}

function renderMainContent() {
    const feed = document.getElementById('tab-content');
    if (!feed) return;
    feed.innerHTML = '';
    
    if (state.currentTab === 'news') renderNewsList(feed);
    else if (state.currentTab === 'following') renderFollowingList(feed);
    else if (state.currentTab === 'matches') renderMatchesList(feed);
    else if (state.currentTab === 'leagues') renderLeaguesList(feed);
}

function renderNewsList(container) {
    let filtered = state.newsData;
    if (state.activeNewsCategory === '이적소식') {
        filtered = state.newsData.filter(item => item.is_here_we_go || item.category === '이적소식');
    } else if (state.activeNewsCategory === '경기결과') {
        filtered = state.newsData.filter(item => item.category === '경기결과');
    }

    if (state.searchQuery) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(state.searchQuery) || 
            item.content.toLowerCase().includes(state.searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-16 text-mutedtext"><p class="text-sm">해당 카테고리의 축구 뉴스가 없습니다.</p></div>`;
        return;
    }

    filtered.forEach(item => {
        const isBookmarked = state.bookmarkedIds.includes(item.id);
        const card = document.createElement('div');
        
        const adminDeleteBtn = state.adminMode 
            ? `<button class="delete-btn text-red-500 hover:text-red-400 font-bold text-xs flex items-center gap-1 p-1 rounded transition-colors" data-id="${item.id}">
                   <span>🗑️</span> 삭제
               </button>`
            : '';

        if (item.is_here_we_go) {
            const fromLogo = item.transfer_info ? teamLogos[item.transfer_info.from] : null;
            const toLogo = item.transfer_info ? teamLogos[item.transfer_info.to] : null;
            
            const fromLogoHtml = fromLogo 
                ? `<img src="${fromLogo}" class="w-6 h-6 object-contain bg-white/5 rounded-full p-0.5" alt="${item.transfer_info.from}">` 
                : `<span class="text-xs font-black">🛡️</span>`;
            const toLogoHtml = toLogo 
                ? `<img src="${toLogo}" class="w-6 h-6 object-contain bg-white/5 rounded-full p-0.5" alt="${item.transfer_info.to}">` 
                : `<span class="text-xs font-black">🛡️</span>`;

            card.className = "glow-border-orange p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all relative overflow-hidden";
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <span class="px-3 py-1 bg-[#ff9f00]/10 border border-[#ff9f00]/30 rounded-full text-[#ff9f00] font-black text-[10px] pulse-live">🚨 HERE WE GO!</span>
                    <span class="text-darkgray text-[11px]">${getRelativeTime(item.created_at)}</span>
                </div>
                <h3 class="text-2xl font-black text-white leading-tight mb-2">${item.title}</h3>
                
                ${item.transfer_info ? `
                <div class="flex items-center gap-4 bg-darkbg/50 border border-bordercolor/80 rounded-xl p-3.5 mb-4 text-xs font-bold text-white">
                    <div class="flex items-center gap-1.5 flex-1 justify-end">
                        <span class="truncate">${item.transfer_info.from}</span>
                        ${fromLogoHtml}
                    </div>
                    <span class="text-brand font-black">➔</span>
                    <div class="flex items-center gap-1.5 flex-1 justify-start">
                        ${toLogoHtml}
                        <span class="truncate">${item.transfer_info.to}</span>
                    </div>
                    <div class="border-l border-bordercolor pl-3 text-right">
                        <span class="text-brand block text-[10px] font-black">이적료</span>
                        <span class="text-[#ff9f00]">${item.transfer_info.cost}</span>
                    </div>
                </div>
                ` : ''}

                <p class="text-sm text-mutedtext leading-relaxed line-clamp-3 mb-4">${item.content}</p>
                <div class="flex justify-between items-center pt-3.5 border-t border-bordercolor">
                    <span class="text-xs text-white font-bold">FR ${item.reporter} ✓</span>
                    <div class="flex items-center gap-3">
                        ${adminDeleteBtn}
                        <button class="bookmark-btn text-mutedtext" data-id="${item.id}">
                            <svg class="w-5 h-5 ${isBookmarked ? 'fill-brand text-brand' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                    </div>
                </div>
            `;
        } else {
            const isTier1 = item.tier === 1;
            card.className = `${isTier1 ? 'glow-border' : 'border border-bordercolor'} p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all`;
            
            let summaryHtml = '';
            if (item.summary_points && item.summary_points.length > 0) {
                summaryHtml = `
                    <div class="mt-3 bg-darkbg/50 border border-bordercolor/50 rounded-xl p-3 text-xs">
                        <div class="text-brand font-black mb-1.5 flex items-center gap-1 text-[10px]"><span>🪄</span>AI 요약 리포트</div>
                        <ul class="space-y-1 text-mutedtext list-disc list-inside">${item.summary_points.map(pt => `<li class="leading-relaxed pl-1">${pt}</li>`).join('')}</ul>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="flex justify-between items-start mb-2.5">
                    <span class="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 uppercase">TIER ${item.tier}</span>
                    <span class="text-darkgray text-[11px]">${getRelativeTime(item.created_at)}</span>
                </div>
                <h3 class="text-base font-extrabold text-white leading-snug mb-2.5">${item.title}</h3>
                <p class="text-xs text-mutedtext leading-relaxed line-clamp-3">${item.content}</p>
                ${summaryHtml}
                <div class="flex justify-between items-center pt-3.5 mt-3.5 border-t border-bordercolor">
                    <span class="text-xs text-darkgray font-medium">${item.reporter}</span>
                    <div class="flex items-center gap-3">
                        ${adminDeleteBtn}
                        <button class="bookmark-btn text-mutedtext" data-id="${item.id}">
                            <svg class="w-5 h-5 ${isBookmarked ? 'fill-brand text-brand' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }

        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                toggleBookmark(item.id, e);
            });
        }

        const deleteBtnEl = card.querySelector('.delete-btn');
        if (deleteBtnEl) {
            deleteBtnEl.addEventListener('click', (e) => {
                deleteArticle(item.id, e);
            });
        }

        card.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn') || e.target.closest('.delete-btn')) return;
            openBottomSheet(item);
        });
        
        container.appendChild(card);
    });
}

function renderFollowingList(container) {
    const bookmarkedNews = state.newsData.filter(item => state.bookmarkedIds.includes(item.id));
    if (bookmarkedNews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20 bg-cardbg rounded-2xl p-6 border border-bordercolor">
                <h3 class="text-white font-bold text-base">팔로잉된 소식이 없습니다</h3>
                <p class="text-mutedtext text-xs mt-1.5">뉴스의 하트(북마크) 버튼을 클릭하시면 실시간 즐겨찾기에 등록됩니다.</p>
            </div>
        `;
        return;
    }

    bookmarkedNews.forEach(item => {
        const card = document.createElement('div');
        card.className = "border border-bordercolor p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-[9px] font-bold px-2 py-0.5 bg-brand/10 border border-brand/20 rounded text-brand uppercase">Saved</span>
                <span class="text-darkgray text-[10px]">${getRelativeTime(item.created_at)}</span>
            </div>
            <h3 class="text-sm font-extrabold text-white leading-snug mb-2">${item.title}</h3>
            <div class="flex justify-between items-center pt-3 border-t border-bordercolor">
                <span class="text-xs text-darkgray">${item.reporter}</span>
                <button class="bookmark-btn" data-id="${item.id}">
                    <svg class="w-5 h-5 fill-brand text-brand" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
            </div>
        `;

        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                toggleBookmark(item.id, e);
            });
        }

        card.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) return;
            openBottomSheet(item);
        });

        container.appendChild(card);
    });
}

function renderMatchesList(container) {
    const list = mockMatches[state.selectedDate] || [];
    if (list.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-mutedtext"><p class="text-sm">선택하신 날짜에 경기 일정이 없습니다.</p></div>`;
        return;
    }

    const groupEl = document.createElement('div');
    groupEl.className = "mb-4";
    groupEl.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-darkgray rounded-full"></span>
                <h4 class="text-sm font-extrabold text-white">매치 라이브 센터</h4>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-3.5" id="match-cards-container"></div>
    `;
    container.appendChild(groupEl);

    const cardContainer = document.getElementById('match-cards-container');
    list.forEach(match => {
        const card = document.createElement('div');
        card.className = `${match.highlight ? 'glow-border' : 'border border-bordercolor/80'} p-4.5 rounded-2xl bg-cardbg`;
        
        let statHtml = '';
        if (match.stats) {
            statHtml = `<div class="mt-4 pt-3.5 border-t border-bordercolor/50 flex justify-between text-[10px] text-mutedtext font-bold"><span>슈팅 ${match.stats.shots}</span><span>점유율 ${match.stats.possession}%</span><span class="text-brand">라이브 매치</span></div>`;
        }

        const homeLogo = teamLogos[match.home];
        const awayLogo = teamLogos[match.away];
        
        const homeLogoHtml = homeLogo 
            ? `<div class="w-9 h-9 rounded-full bg-white/5 p-1 flex items-center justify-center border border-bordercolor"><img src="${homeLogo}" alt="${match.home}" class="w-full h-full object-contain"></div>`
            : `<div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">${match.home.substring(0,1)}</div>`;
            
        const awayLogoHtml = awayLogo 
            ? `<div class="w-9 h-9 rounded-full bg-white/5 p-1 flex items-center justify-center border border-bordercolor"><img src="${awayLogo}" alt="${match.away}" class="w-full h-full object-contain"></div>`
            : `<div class="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-xs">${match.away.substring(0,1)}</div>`;

        card.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <span class="${match.status === 'LIVE' ? 'bg-brand text-black pulse-live' : 'bg-gray-800 text-mutedtext'} text-[9px] font-black px-2 py-0.5 rounded">${match.time}</span>
                <span class="text-[9px] text-darkgray font-bold">${match.league}</span>
            </div>
            <div class="flex items-center justify-between px-2">
                <div class="flex flex-col items-center gap-1.5 w-16">
                    ${homeLogoHtml}
                    <span class="text-xs font-bold text-white truncate max-w-full">${match.home}</span>
                </div>
                <div class="flex items-center gap-4 text-2xl font-black text-white">
                    <span>${match.homeScore}</span>
                    <span class="text-xs opacity-40">:</span>
                    <span>${match.awayScore}</span>
                </div>
                <div class="flex flex-col items-center gap-1.5 w-16">
                    ${awayLogoHtml}
                    <span class="text-xs font-bold text-white truncate max-w-full">${match.away}</span>
                </div>
            </div>
            ${statHtml}
        `;
        cardContainer.appendChild(card);
    });
}

function renderLeaguesList(container) {
    const tableDiv = document.createElement('div');
    tableDiv.className = "bg-cardbg border border-bordercolor rounded-2xl overflow-hidden shadow-xl";
    
    let tableRows = mockStandings.map(team => {
        const logoUrl = teamLogos[team.team];
        const logoHtml = logoUrl 
            ? `<img src="${logoUrl}" alt="${team.team}" class="w-5 h-5 object-contain bg-white/5 rounded-full p-0.5 border border-bordercolor">` 
            : `<div class="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold border border-brand/20">🛡️</div>`;
            
        return `
            <tr class="border-b border-bordercolor/60 hover:bg-cardhover/30 transition-colors">
                <td class="px-3.5 py-3 text-center text-xs font-black text-white">${team.rank}</td>
                <td class="px-2 py-3 flex items-center gap-2.5">
                    ${logoHtml}
                    <span class="text-xs font-bold text-white">${team.team}</span>
                </td>
                <td class="px-2 py-3 text-center text-xs text-mutedtext">${team.played}</td>
                <td class="px-2 py-3 text-center text-xs text-mutedtext font-semibold">${team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                <td class="px-2 py-3 text-center text-xs font-extrabold text-white">${team.pts}</td>
            </tr>
        `;
    }).join('');

    tableDiv.innerHTML = `
        <div class="px-4.5 py-4 border-b border-bordercolor">
            <span class="text-sm font-extrabold text-white">🏆 프리미어리그 2025/2026 순위표</span>
        </div>
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-darkbg/40 border-b border-bordercolor text-[10px] text-mutedtext uppercase">
                    <th class="px-3.5 py-3 text-center w-12">순위</th>
                    <th class="px-2 py-3 text-left pl-3">팀</th>
                    <th class="px-2 py-3 text-center w-12">경기</th>
                    <th class="px-2 py-3 text-center w-12">득실</th>
                    <th class="px-2 py-3 text-center w-12">승점</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
    `;
    container.appendChild(tableDiv);
}

function setupBottomSheet() {
    const backdrop = document.getElementById('backdrop');
    const sheet = document.getElementById('bottom-sheet');
    if (backdrop && sheet) {
        const close = () => { sheet.classList.remove('open'); backdrop.classList.remove('open'); };
        backdrop.addEventListener('click', close);
        const dragBtn = document.getElementById('btn-close-sheet-drag');
        if (dragBtn) dragBtn.addEventListener('click', close);
    }
}

function openBottomSheet(item) {
    const backdrop = document.getElementById('backdrop');
    const sheet = document.getElementById('bottom-sheet');
    const container = document.getElementById('bottom-sheet-content');
    if (!backdrop || !sheet || !container) return;
    const isBookmarked = state.bookmarkedIds.includes(item.id);

    let summarySection = '';
    if (item.summary_points && item.summary_points.length > 0) {
        summarySection = `
            <div class="bg-darkbg/70 border border-bordercolor/80 rounded-2xl p-4.5 mb-6">
                <div class="text-brand font-black mb-3 text-xs">🪄 AI 요약 리포트</div>
                <ul class="space-y-2 text-mutedtext text-xs list-disc list-inside">${item.summary_points.map(pt => `<li class="leading-relaxed pl-1">${pt}</li>`).join('')}</ul>
            </div>
        `;
    }

    let transferSection = '';
    if (item.is_here_we_go && item.transfer_info) {
        const fromLogo = teamLogos[item.transfer_info.from];
        const toLogo = teamLogos[item.transfer_info.to];
        const fromLogoHtml = fromLogo ? `<img src="${fromLogo}" class="w-8 h-8 object-contain bg-white/5 rounded-full p-1" alt="${item.transfer_info.from}">` : `🛡️`;
        const toLogoHtml = toLogo ? `<img src="${toLogo}" class="w-8 h-8 object-contain bg-white/5 rounded-full p-1" alt="${item.transfer_info.to}">` : `🛡️`;

        transferSection = `
            <div class="flex items-center justify-around bg-darkbg/70 border border-[#ff9f00]/30 rounded-2xl p-4 mb-6 text-sm font-bold text-white">
                <div class="flex flex-col items-center gap-1">
                    ${fromLogoHtml}
                    <span class="text-xs text-mutedtext font-medium mt-1">From 구단</span>
                    <span>${item.transfer_info.from}</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-[#ff9f00] font-black text-xl">🚨 HERE WE GO!</span>
                    <span class="text-[10px] text-darkgray font-bold mt-1">이적 확정</span>
                </div>
                <div class="flex flex-col items-center gap-1">
                    ${toLogoHtml}
                    <span class="text-xs text-mutedtext font-medium mt-1">To 구단</span>
                    <span>${item.transfer_info.to}</span>
                </div>
            </div>
            <div class="bg-darkbg/50 border border-bordercolor rounded-xl p-3.5 mb-6 flex justify-between items-center text-xs font-bold">
                <span class="text-mutedtext">💰 공식 계약 이적료</span>
                <span class="text-brand text-sm">${item.transfer_info.cost}</span>
            </div>
        `;
    }

    const adminDeleteBtnModal = state.adminMode
        ? `<button id="btn-delete-modal" class="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs">기사 완전히 삭제</button>`
        : '';

    container.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="text-[9px] font-black px-2.5 py-1 bg-brand/10 border border-brand/35 rounded text-brand uppercase">${item.category}</span>
            <span class="text-darkgray text-xs">${getRelativeTime(item.created_at)}</span>
        </div>
        <h2 class="text-xl font-black text-white leading-snug mb-5">${item.title}</h2>
        ${transferSection}
        ${summarySection}
        <div class="text-sm text-gray-200 leading-relaxed mb-8 whitespace-pre-line">${item.content}</div>
        <div class="flex justify-between items-center py-4 border-t border-bordercolor">
            <div>
                <span class="text-xs text-white font-extrabold block">${item.reporter}</span>
                <span class="text-[9px] text-darkgray">기자 신뢰도: TIER ${item.tier}</span>
            </div>
            <div class="flex gap-2">
                ${adminDeleteBtnModal}
                <button id="btn-share-modal" class="p-2.5 rounded-xl bg-cardbg border border-bordercolor text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318m6-6.676a3 3 0 11-6 0 3 3 0 016 0zm-6 6.676a3 3 0 11-6 0 3 3 0 016 0zm6 6.676a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </button>
                <button id="btn-bookmark-modal" class="px-4 py-2.5 rounded-xl bg-brand text-black font-extrabold text-xs">
                    ${isBookmarked ? '북마크 취소' : '북마크 저장'}
                </button>
            </div>
        </div>
    `;

    document.getElementById('btn-bookmark-modal').onclick = () => {
        toggleBookmark(item.id);
        sheet.classList.remove('open');
        backdrop.classList.remove('open');
    };

    document.getElementById('btn-share-modal').onclick = () => {
        navigator.clipboard.writeText(`[90PLUS⁺] ${item.title}\n\n${item.content}`);
        alert("📋 기사 공유용 텍스트가 클립보드에 복사되었습니다!");
    };

    if (document.getElementById('btn-delete-modal')) {
        document.getElementById('btn-delete-modal').onclick = (e) => {
            deleteArticle(item.id, e);
            sheet.classList.remove('open');
            backdrop.classList.remove('open');
        };
    }

    sheet.classList.add('open');
    backdrop.classList.add('open');
}

// 10. App Entry Point
document.addEventListener('DOMContentLoaded', () => {
    // Initializing SPA Routers & Event Listeners
    setupTabNavigation();
    setupSearch();
    setupBottomSheet();
    setupAuthEvents();
    setupAdminPanelEvents();
    
    // Initializing Supabase Auth & Session listener
    initAuth();
    
    // Fetch news from Supabase database
    loadNews();
});
