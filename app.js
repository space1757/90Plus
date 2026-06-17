// =========================================================================
// 90PLUS⁺ Premium Sports Dashboard - Unified Application Engine (v2.4.0)
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
    deletedIds: JSON.parse(localStorage.getItem('90plus_deleted') || '[]'),
    searchQuery: '',
    user: null,         // Supabase Auth User Object
    adminMode: false    // Admin authorization toggle
};

// 2.2. Premium Floating Toast Notification Engine
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Auto-destroy after duration using safe double-setTimeout
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// 2.3. Override Native Alert System with Premium Toast
window.alert = function(message) {
    let type = 'info';
    
    // Fallback if message is not string
    const msgStr = String(message);
    const lower = msgStr.toLowerCase();
    
    if (lower.includes('성공') || lower.includes('완료') || lower.includes('환영') || lower.includes('here we go') || lower.includes('복사') || lower.includes('성공적으로')) {
        type = 'success';
    } else if (lower.includes('실패') || lower.includes('오류') || lower.includes('에러') || lower.includes('예약된') || lower.includes('제한')) {
        type = 'error';
    } else if (lower.includes('임시') || lower.includes('오프라인') || lower.includes('서버 연결') || lower.includes('지연') || lower.includes('단,')) {
        type = 'warning';
    }
    
    showToast(msgStr, type);
};

// 2.1. Offline Real-time Tab Synchronization
const offlineSyncChannel = window.BroadcastChannel ? new BroadcastChannel('90plus_offline_sync') : null;
if (offlineSyncChannel) {
    offlineSyncChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'sync_news') {
            console.log('Offline BroadcastChannel sync received!');
            loadNews();
        }
    };
}

// 3. Official Club Logo Emblems (Guaranteed 100% Hotlink-Safe FotMob High-Res CDN Paths)
const teamLogos = {
    "아스날": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "맨시티": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "맨유": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "애스턴 빌라": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "리버풀": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "본머스": "https://images.fotmob.com/image_resources/logo/teamlogo/8678.png",
    "선덜랜드": "https://images.fotmob.com/image_resources/logo/teamlogo/8472.png",
    "브라이턴": "https://images.fotmob.com/image_resources/logo/teamlogo/10204.png",
    "브렌트퍼드": "https://images.fotmob.com/image_resources/logo/teamlogo/9937.png",
    "첼시": "https://images.fotmob.com/image_resources/logo/teamlogo/8455.png",
    "풀럼": "https://images.fotmob.com/image_resources/logo/teamlogo/9879.png",
    "뉴캐슬": "https://images.fotmob.com/image_resources/logo/teamlogo/10261.png",
    "에버턴": "https://images.fotmob.com/image_resources/logo/teamlogo/8668.png",
    "리즈 유나이티드": "https://images.fotmob.com/image_resources/logo/teamlogo/8463.png",
    "크리스털 팰리스": "https://images.fotmob.com/image_resources/logo/teamlogo/9826.png",
    "노팅엄 포레스트": "https://images.fotmob.com/image_resources/logo/teamlogo/10203.png",
    "토트넘": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "웨스트 햄": "https://images.fotmob.com/image_resources/logo/teamlogo/8654.png",
    "번리": "https://images.fotmob.com/image_resources/logo/teamlogo/8191.png",
    "울브스": "https://images.fotmob.com/image_resources/logo/teamlogo/8602.png",
    "나폴리": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "파리 생제르맹": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "바르샤": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "레알": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png"
};

// 4. Premium Mock Data (Offline Fallbacks)
const mockNews = [];

// EPL Real Standings (EPL Actual Standings Synchronized with user screenshot)
const mockStandings = [
    { rank: 1, team: "아스날", played: 38, win: 26, draw: 7, loss: 5, gd: 44, pts: 85 },
    { rank: 2, team: "맨시티", played: 38, win: 23, draw: 9, loss: 6, gd: 42, pts: 78 },
    { rank: 3, team: "맨유", played: 38, win: 20, draw: 11, loss: 7, gd: 19, pts: 71 },
    { rank: 4, team: "애스턴 빌라", played: 38, win: 19, draw: 8, loss: 11, gd: 7, pts: 65 },
    { rank: 5, team: "리버풀", played: 38, win: 17, draw: 9, loss: 12, gd: 10, pts: 60 },
    { rank: 6, team: "본머스", played: 38, win: 13, draw: 18, loss: 7, gd: 4, pts: 57 },
    { rank: 7, team: "선덜랜드", played: 38, win: 14, draw: 12, loss: 12, gd: -6, pts: 54 },
    { rank: 8, team: "브라이턴", played: 38, win: 14, draw: 11, loss: 13, gd: 6, pts: 53 },
    { rank: 9, team: "브렌트퍼드", played: 38, win: 14, draw: 11, loss: 13, gd: 3, pts: 53 },
    { rank: 10, team: "첼시", played: 38, win: 14, draw: 10, loss: 14, gd: 6, pts: 52 },
    { rank: 11, team: "풀럼", played: 38, win: 15, draw: 7, loss: 16, gd: -4, pts: 52 },
    { rank: 12, team: "뉴캐슬", played: 38, win: 14, draw: 7, loss: 17, gd: -2, pts: 49 },
    { rank: 13, team: "에버턴", played: 38, win: 13, draw: 10, loss: 15, gd: -3, pts: 49 },
    { rank: 14, team: "리즈 유나이티드", played: 38, win: 11, draw: 14, loss: 13, gd: -7, pts: 47 },
    { rank: 15, team: "크리스털 팰리스", played: 38, win: 11, draw: 12, loss: 15, gd: -10, pts: 45 },
    { rank: 16, team: "노팅엄 포레스트", played: 38, win: 11, draw: 11, loss: 16, gd: -3, pts: 44 },
    { rank: 17, team: "토트넘", played: 38, win: 10, draw: 11, loss: 17, gd: -9, pts: 41 },
    { rank: 18, team: "웨스트 햄", played: 38, win: 10, draw: 9, loss: 19, gd: -19, pts: 39 },
    { rank: 19, team: "번리", played: 38, win: 4, draw: 10, loss: 24, gd: -37, pts: 22 },
    { rank: 20, team: "울브스", played: 38, win: 3, draw: 11, loss: 24, gd: -41, pts: 20 }
];

// 5. Utility Functions
function nicknameToEmail(nickname) {
    if (!nickname) return '';
    const encoder = new TextEncoder();
    const hex = Array.from(encoder.encode(nickname.trim()))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return `${hex}@90plus.co`;
}

async function registerProfile(id, nickname, favTeam) {
    const role = nickname.toLowerCase() === 'adminofficial' ? 'admin' : 'user';
    const profile = { id, nickname, fav_team: favTeam, role };
    
    // Always store locally as fallback
    const localUsers = JSON.parse(localStorage.getItem('90plus_offline_users') || '[]');
    const existingIndex = localUsers.findIndex(u => u.nickname.toLowerCase() === nickname.toLowerCase());
    if (existingIndex !== -1) {
        localUsers[existingIndex] = profile;
    } else {
        localUsers.push(profile);
    }
    localStorage.setItem('90plus_offline_users', JSON.stringify(localUsers));

    if (sbClient) {
        try {
            const { error } = await sbClient.from('profiles').upsert(profile);
            if (error) console.warn("Supabase profiles table upsert failed:", error);
        } catch(e) {
            console.warn("Supabase profiles table upsert failed:", e);
        }
    }
}

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

    const offlineNews = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
    if (!sbClient) {
        state.newsData = [...mockNews, ...offlineNews];
        state.newsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
            let isMatchResult = parsedJson?.is_match_result || false;
            let category = parsedJson?.category || item.category || "최신뉴스";
            let summaryPoints = parsedJson?.summary || [];
            let transferInfo = parsedJson?.transfer_info || item.transfer_info || null;
            let tag = parsedJson?.tag || item.tag || null;

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
                is_match_result: isMatchResult,
                category,
                summary_points: summaryPoints,
                transfer_info: transferInfo,
                tag: tag,
                // Match Results Fields Mapping
                league: parsedJson?.league || null,
                round: parsedJson?.round || null,
                home: parsedJson?.home || null,
                away: parsedJson?.away || null,
                homeScore: parsedJson?.homeScore !== undefined ? parsedJson.homeScore : null,
                awayScore: parsedJson?.awayScore !== undefined ? parsedJson.awayScore : null,
                comment: parsedJson?.comment || null
            };
        });

        // Merge Mock + DB news + Offline news, remove duplicates based on content prefix
        const mergedNews = [...mockNews, ...offlineNews, ...parsedDbNews];
        const uniqueMap = new Map();
        mergedNews.forEach(item => {
            const key = item.content.substring(0, 30);
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });

        state.newsData = Array.from(uniqueMap.values());
        // Filter out persistent deleted articles
        state.newsData = state.newsData.filter(item => !state.deletedIds.includes(String(item.id)));
        state.newsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (err) {
        console.error("DB Load failed, fallback to offline mocks:", err);
        state.newsData = [...mockNews, ...offlineNews]; 
        state.newsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } finally {
        renderTopNav();
        renderMainContent();
        
        // Trigger live notifications for user's favorite team news
        triggerFavTeamAlert();
    }
}

// 7. Supabase Auth Module Integration
async function initAuth() {
    const offlineUser = localStorage.getItem('90plus_offline_user');
    if (!sbClient) {
        if (offlineUser) {
            try {
                state.user = JSON.parse(offlineUser);
                state.adminMode = state.user ? (
                    state.user.user_metadata?.nickname === 'admin' ||
                    state.user.user_metadata?.nickname === 'adminofficial' ||
                    state.user.user_metadata?.role === 'admin'
                ) : false;
            } catch (e) {}
        }
        updateAuthUI(); // Call updateAuthUI even if sbClient is null to render Guest profile button correctly!
        return;
    }

    // Listen to real-time Auth State Changes
    sbClient.auth.onAuthStateChange((event, session) => {
        state.user = session?.user || null;
        
        // Define admin accounts (admin nickname, virtual admin email, or explicit metadata claim)
        state.adminMode = state.user ? (
            state.user.user_metadata?.nickname === 'admin' || 
            state.user.user_metadata?.nickname === 'adminofficial' || 
            state.user.email === nicknameToEmail('admin') ||
            state.user.email === nicknameToEmail('adminofficial') ||
            state.user.user_metadata?.role === 'admin'
        ) : false;
        
        updateAuthUI();
        triggerFavTeamAlert();
    });

    // Check current active session
    try {
        const { data: { session } } = await sbClient.auth.getSession();
        state.user = session?.user || null;
        state.adminMode = state.user ? (
            state.user.user_metadata?.nickname === 'admin' || 
            state.user.user_metadata?.nickname === 'adminofficial' || 
            state.user.email === nicknameToEmail('admin') ||
            state.user.email === nicknameToEmail('adminofficial') ||
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
        // User logged in state (Using Tailwind standard size w-6 h-6)
        // Auto register and render user's favorite EPL team logo emblem as Profile Avatar!
        const userFavTeam = state.user.user_metadata?.fav_team;
        const favLogo = teamLogos[userFavTeam];
        
        let profileHtml = '';
        if (favLogo) {
            profileHtml = `
                <div class="relative">
                    <img src="${favLogo}" class="w-6 h-6 object-contain bg-white/10 rounded-full p-0.5 border border-brand shadow-md" alt="Fav Team Avatar">
                    <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-darkbg"></span>
                </div>
            `;
        } else {
            profileHtml = `
                <div class="relative">
                    <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-darkbg"></span>
                </div>
            `;
        }

        btnAuthToggle.innerHTML = profileHtml;
        
        if (authUserInfo) authUserInfo.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
        if (formSignup) formSignup.classList.add('hidden');
        if (authTabContainer) authTabContainer.classList.add('hidden');

        const nickname = state.user.user_metadata?.nickname || state.user.user_metadata?.name || "사용자";
        const favTeamText = userFavTeam ? ` (${userFavTeam} 팬)` : '';
        if (displayName) displayName.textContent = `${nickname}님${favTeamText}`;
        if (displayEmail) displayEmail.textContent = `@${nickname}`;

        // Auto-select current favorite team in profile panel dropdown
        const profileFavTeamSelect = document.getElementById('user-profile-fav-team');
        if (profileFavTeamSelect) {
            profileFavTeamSelect.value = userFavTeam || '';
        }
        
        if (avatar) {
            if (favLogo) {
                avatar.innerHTML = `<img src="${favLogo}" class="w-full h-full object-contain p-1" alt="Fav Team">`;
                avatar.className = "w-16 h-16 bg-white/5 border border-brand rounded-full mx-auto overflow-hidden";
            } else {
                avatar.textContent = nickname.substring(0, 1).toUpperCase();
                avatar.className = "w-16 h-16 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center text-brand text-2xl font-black mx-auto";
            }
        }

        if (state.adminMode) {
            if (adminBadge) adminBadge.classList.remove('hidden');
            if (btnAdminPanel) btnAdminPanel.classList.remove('hidden');
        } else {
            if (adminBadge) adminBadge.classList.add('hidden');
            if (btnAdminPanel) btnAdminPanel.classList.add('hidden');
        }
    } else {
        // Guest / Logged out state (Using Tailwind standard size w-6 h-6)
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
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = document.getElementById('login-nickname').value.trim();
            const password = document.getElementById('login-password').value;
            const email = nicknameToEmail(nickname);

            // Intercept static admin credentials
            if (nickname.toLowerCase() === 'adminofficial' && password === '090829') {
                if (sbClient) {
                    try {
                        let authData = null;
                        
                        // 1. Try to sign in using Supabase Auth
                        const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
                        
                        if (error) {
                            // 2. If user not found (e.g. status 400 or credentials mismatch), attempt auto-signUp
                            if (error.status === 400 || error.message.toLowerCase().includes("invalid login credentials")) {
                                console.log("Admin account not found in Auth. Attempting auto-registration...");
                                const signUpRes = await sbClient.auth.signUp({
                                    email,
                                    password,
                                    options: {
                                        data: { nickname: 'adminofficial', role: 'admin', fav_team: '' }
                                    }
                                });
                                if (signUpRes.error) {
                                    if (signUpRes.error.message.toLowerCase().includes("already registered") || signUpRes.error.status === 422) {
                                        throw new Error("Supabase Auth에 adminofficial 계정이 이미 존재하지만 비밀번호가 일치하지 않습니다. 올바른 비밀번호를 입력하거나 DB에서 해당 계정을 삭제 후 다시 시도해 주세요.");
                                    }
                                    throw signUpRes.error;
                                }
                                
                                // Retry sign in
                                const retryRes = await sbClient.auth.signInWithPassword({ email, password });
                                if (retryRes.error) throw retryRes.error;
                                authData = retryRes.data;
                            } else {
                                throw error;
                            }
                        } else {
                            authData = data;
                        }

                        if (authData && authData.user) {
                            state.user = authData.user;
                            state.adminMode = true;
                            localStorage.setItem('90plus_offline_user', JSON.stringify(authData.user));
                            
                            let profileSyncError = null;
                            try {
                                await registerProfile(authData.user.id, 'adminofficial', '');
                            } catch(profileErr) {
                                profileSyncError = profileErr.message;
                            }

                            updateAuthUI();
                            if (profileSyncError) {
                                alert(`🔓 [온라인] 관리자 계정 로그인 성공!\n\n⚠️ 단, 프로필 데이터를 서버와 실시간 동기화하지 못했습니다.\n(사유: ${profileSyncError})`);
                            } else {
                                alert("🔓 [온라인] 관리자 계정 로그인 성공! 실시간 데이터베이스에 즉시 반영됩니다.");
                            }
                            authBackdrop.classList.remove('open');
                            loadNews();
                            return;
                        }
                    } catch (authErr) {
                        console.warn("Supabase Admin Auth login failed:", authErr);
                        alert(`❌ 관리자 로그인 실패: ${authErr.message || authErr}`);
                        return;
                    }
                }
                return;
            }

            if (!sbClient) {
                alert("❌ [서버 오프라인] 실시간 서버 연결이 끊겨 로그인할 수 없습니다.");
                return;
            }

            try {
                const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                
                if (data && data.user) {
                    const nick = data.user.user_metadata?.nickname || nickname;
                    const fav = data.user.user_metadata?.fav_team || '';
                    await registerProfile(data.user.id, nick, fav);
                }

                alert("🔓 로그인 성공! 환영합니다.");
                authBackdrop.classList.remove('open');
            } catch (err) {
                console.warn("Supabase login failed:", err);
                alert(`❌ 로그인 실패: ${err.message}`);
            }
        });
    }

    if (formSignup) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = document.getElementById('signup-name').value.trim();
            const favTeam = document.getElementById('signup-fav-team').value;
            const password = document.getElementById('signup-password').value;
            const email = nicknameToEmail(nickname);

            if (!sbClient) {
                alert("❌ [서버 오프라인] 실시간 서버 연결이 끊겨 회원가입을 진행할 수 없습니다.");
                return;
            }

            try {
                const { data, error } = await sbClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { nickname, fav_team: favTeam }
                    }
                });
                if (error) throw error;
                
                if (data && data.user) {
                    await registerProfile(data.user.id, nickname, favTeam);
                }

                alert("✉️ 회원가입이 성공적으로 완료되었습니다! 즉시 로그인해 보세요.");
                switchAuthTab('login');
                const loginNickInput = document.getElementById('login-nickname');
                if (loginNickInput) loginNickInput.value = nickname;
            } catch (err) {
                console.warn("Supabase signup failed:", err);
                alert(`❌ 회원가입 실패: ${err.message}`);
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (!sbClient) {
                state.user = null;
                state.adminMode = false;
                updateAuthUI();
                alert("🔒 [오프라인 모드] 로그아웃 되었습니다.");
                authBackdrop.classList.remove('open');
                loadNews();
                return;
            }
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

    // User profile favorite team update handler
    const btnUpdateFavTeam = document.getElementById('btn-update-fav-team');
    if (btnUpdateFavTeam) {
        btnUpdateFavTeam.addEventListener('click', async () => {
            const selectEl = document.getElementById('user-profile-fav-team');
            if (!selectEl) return;
            const newFavTeam = selectEl.value;

            if (state.user) {
                btnUpdateFavTeam.disabled = true;
                btnUpdateFavTeam.textContent = "저장 중...";
                try {
                    const isMockUser = state.user.id.startsWith('offline-') || state.user.id === 'admin-fixed-id';
                    
                    if (sbClient && !isMockUser) {
                        const { error } = await sbClient.auth.updateUser({
                            data: { fav_team: newFavTeam }
                        });
                        if (error) throw error;
                    }
                    
                    state.user.user_metadata = {
                        ...state.user.user_metadata,
                        fav_team: newFavTeam
                    };
                    
                    // Save to local storage offline session memory
                    localStorage.setItem('90plus_offline_user', JSON.stringify(state.user));

                    // Update in the offline profile index
                    const offlineUsers = JSON.parse(localStorage.getItem('90plus_offline_users') || '[]');
                    const localUser = offlineUsers.find(u => u.id === state.user.id || u.nickname === state.user.user_metadata?.nickname);
                    if (localUser) {
                        localUser.fav_team = newFavTeam;
                        localStorage.setItem('90plus_offline_users', JSON.stringify(offlineUsers));
                    }

                    // Update Supabase profiles table directly
                    if (sbClient) {
                        try {
                            const nickname = state.user.user_metadata?.nickname || '';
                            const role = state.adminMode ? 'admin' : 'user';
                            const { error: upsertErr } = await sbClient.from('profiles').upsert({
                                id: state.user.id,
                                nickname,
                                fav_team: newFavTeam,
                                role
                            });
                            if (upsertErr) throw upsertErr;
                        } catch (e) {
                            console.warn("Profiles table upsert failed during team update:", e);
                            alert(`⚠️ 선호팀 정보가 로컬 기기에서만 임시 변경되었습니다.\n서버 동기화 실패 사유: ${e.message || e}`);
                            updateAuthUI();
                            renderMainContent();
                            return;
                        }
                    }
                    
                    alert("🌟 선호팀이 성공적으로 변경되었습니다!");
                    updateAuthUI();
                    renderMainContent();
                } catch (err) {
                    alert(`❌ 선호팀 변경 실패: ${err.message}`);
                } finally {
                    btnUpdateFavTeam.disabled = false;
                    btnUpdateFavTeam.textContent = "변경";
                }
            } else {
                alert("🔒 선호팀 변경을 하려면 먼저 로그인해 주세요.");
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
5. 출력 형식은 반드시 JSON 형태여야 합니다.

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
                    { text: userMessage }
                ]
            }
        ],
        systemInstruction: {
            parts: [
                { text: systemPrompt }
            ]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    content: { type: "STRING" },
                    summary: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                    }
                },
                required: ["content", "summary"]
            }
        }
    };

    const response = await withTimeout(
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        }),
        10000
    );

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
        return JSON.parse(responseText.trim());
    } catch (e) {
        throw new Error("Gemini 응답 JSON 파싱 실패: " + e.message);
    }
}

async function generateAiMatchResult(apiKey, query) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `
당신은 대한민국 최고의 스포츠 매거진 '90PLUS⁺'의 경기 기록 자동 분석 시스템입니다.
사용자가 요청한 축구 경기에 대한 정보를 구글 검색을 통해 실시간으로 탐색한 뒤, 아래 약속된 JSON 규격으로 경기 결과를 완벽하고 무결한 팩트 데이터로 추출해야 합니다.
허위 사실이나 아직 치러지지 않은 경기에 대한 가짜 예측 스코어가 절대 들어가지 않도록 극도로 주의하십시오.

[구단명 맵핑 매칭 약속 규칙]
EPL 구단명은 반드시 다음 20개 이름 중 하나로 정확하게 매핑하여 반환해야 합니다:
"아스날", "맨시티", "맨유", "애스턴 빌라", "리버풀", "본머스", "선덜랜드", "브라이턴", "브렌트퍼드", "첼시", "풀럼", "뉴캐슬", "에버턴", "리즈 유나이티드", "크리스털 팰리스", "노팅엄 포레스트", "토트넘", "웨스트 햄", "번리", "울브스"

[출력 JSON 구조 규격]
반드시 아래 JSON 구조로만 답변해야 합니다. 마크다운 백틱(\`\`\`json ... \`\`\`)을 포함하여 작성해 주세요.
{
    "league": "프리미어리그" | "챔피언스리그" | "유로파리그" | "FA컵" 중 하나 (가장 어울리는 대회 선택),
    "round": "예시: 26-27시즌 1라운드",
    "home": "EPL 20개 구단명 중 홈 구단",
    "away": "EPL 20개 구단명 중 원정 구단",
    "homeScore": 홈팀 득점 수 (정수),
    "awayScore": 원정팀 득점 수 (정수),
    "comment": "예시: 아스날: 사카 45' (PK) | 리버풀: 살라 72' (도움: 누녜스)" 형식의 골 기록 및 경기 요약 (실제 득점 선수의 한글 이름과 시간대를 구글 실시간 검색 기반으로 완벽 검증하여 포함할 것)
}
`;

    const response = await withTimeout(
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `검색어: "${query}"\n\n위 검색어에 부합하는 경기를 구글 검색을 통해 실시간 탐색하여, 가장 신뢰성 높은 최신 경기결과 정보로 JSON을 생성해줘.` }]
                }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                tools: [{ google_search: {} }] // Google Search Grounding Enabled!
                // Note: responseMimeType is omitted to prevent conflict with tools (HTTP 400)
            })
        }),
        10000
    );

    if (!response.ok) {
        throw new Error(`Gemini API 통신 장애: HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
        throw new Error("Gemini로부터 경기 결과 팩트를 추출하지 못했습니다.");
    }

    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("응답에서 JSON 데이터를 추출할 수 없습니다.");
        }
        return JSON.parse(jsonMatch[0].trim());
    } catch (e) {
        throw new Error("Gemini 응답 JSON 파싱 실패: " + e.message + "\n\n원문: " + responseText);
    }
}

async function deleteArticle(id, event) {
    if (event) event.stopPropagation();
    
    if (!confirm("🗑️ 이 축구 기사(또는 이적 소식)를 정말로 삭제하시겠습니까?")) return;

    try {
        const stringId = String(id);
        
        // Record deleted ID in local storage to prevent reappearing on reload
        if (!state.deletedIds.includes(stringId)) {
            state.deletedIds.push(stringId);
            localStorage.setItem('90plus_deleted', JSON.stringify(state.deletedIds));
        }

        if (stringId.startsWith('offline-')) {
            // Local offline news/transfer/match deletion
            let currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
            currentOffline = currentOffline.filter(n => String(n.id) !== stringId);
            localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));
            alert("🗑️ 오프라인 기사가 성공적으로 삭제되었습니다.");
            
            if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
            loadNews();
            return;
        } else if (stringId.startsWith('mock-')) {
            // Local Mock News deletion
            const idx = mockNews.findIndex(n => n.id === id);
            if (idx !== -1) mockNews.splice(idx, 1);
            alert("🗑️ 기사가 완전히 삭제되어 다시는 표시되지 않습니다.");
        } else if (sbClient) {
            // Live Supabase DB News deletion
            const { error } = await withTimeout(
                sbClient
                    .from('football_news')
                    .delete()
                    .eq('id', id),
                3500
            );

            if (error) throw error;
            alert("🗑️ 기사가 데이터베이스에서 완전히 삭제되었습니다!");
        }
        
        // Reload feeds
        loadNews();
    } catch (err) {
        alert(`❌ 기사 삭제 실패: ${err.message}`);
    }
}

// Live alert notification logic for favorite EPL team news
let isAlertTriggered = false; // Prevent multiple annoying alerts
function triggerFavTeamAlert() {
    if (!state.user || isAlertTriggered) return;
    const myTeam = state.user.user_metadata?.fav_team;
    if (!myTeam) return;

    const hasMyTeamNews = state.newsData.some(item => 
        (Array.isArray(item.tag) ? item.tag.includes(myTeam) : item.tag === myTeam) ||
        (item.is_match_result && (item.home === myTeam || item.away === myTeam)) ||
        item.title.includes(myTeam) || 
        item.content.includes(myTeam)
    );

    if (hasMyTeamNews) {
        isAlertTriggered = true;
        setTimeout(() => {
            alert(`🔔 선호팀 소식 알림: 응원하시는 '${myTeam}'의 새로운 경기 및 이적 정보가 업데이트되었습니다! 피드에서 라임색 테두리로 강조된 기사를 바로 확인해보세요.`);
        }, 1000);
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

    const tabMatchResult = document.getElementById('admin-tab-match-result');
    const formAdminMatchResult = document.getElementById('form-admin-match-result');

    const tabUsers = document.getElementById('admin-tab-users');
    const panelUsers = document.getElementById('panel-admin-users');

    if (tabWrite && tabTransfer && tabMatchResult && formAdminNews && formAdminTransfer && formAdminMatchResult) {
        tabWrite.addEventListener('click', () => {
            tabWrite.className = "flex-1 pb-3 border-b-2 border-brand text-brand";
            tabTransfer.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            tabMatchResult.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            if (tabUsers) tabUsers.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            formAdminNews.classList.remove('hidden');
            formAdminTransfer.classList.add('hidden');
            formAdminMatchResult.classList.add('hidden');
            if (panelUsers) panelUsers.classList.add('hidden');
        });
        tabTransfer.addEventListener('click', () => {
            tabTransfer.className = "flex-1 pb-3 border-b-2 border-brand text-brand";
            tabWrite.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            tabMatchResult.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            if (tabUsers) tabUsers.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            formAdminTransfer.classList.remove('hidden');
            formAdminNews.classList.add('hidden');
            formAdminMatchResult.classList.add('hidden');
            if (panelUsers) panelUsers.classList.add('hidden');
        });
        tabMatchResult.addEventListener('click', () => {
            tabMatchResult.className = "flex-1 pb-3 border-b-2 border-brand text-brand";
            tabWrite.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            tabTransfer.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            if (tabUsers) tabUsers.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
            formAdminMatchResult.classList.remove('hidden');
            formAdminNews.classList.add('hidden');
            formAdminTransfer.classList.add('hidden');
            if (panelUsers) panelUsers.classList.add('hidden');
        });
        if (tabUsers && panelUsers) {
            tabUsers.addEventListener('click', () => {
                tabUsers.className = "flex-1 pb-3 border-b-2 border-brand text-brand";
                tabWrite.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
                tabTransfer.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
                tabMatchResult.className = "flex-1 pb-3 border-b-2 border-transparent text-mutedtext hover:text-white";
                panelUsers.classList.remove('hidden');
                formAdminNews.classList.add('hidden');
                formAdminTransfer.classList.add('hidden');
                formAdminMatchResult.classList.add('hidden');
                loadUserProfiles();
            });
        }
    }

    const btnGenerateAi = document.getElementById('btn-generate-ai-text');
    if (btnGenerateAi) {
        btnGenerateAi.addEventListener('click', async () => {
            const title = document.getElementById('admin-news-title').value.trim();
            const outline = document.getElementById('admin-news-outline').value.trim();
            
            const keyInputEl = document.getElementById('gemini-api-key');
            let apiKey = keyInputEl ? keyInputEl.value.trim() : '';
            if (apiKey) {
                localStorage.setItem('90plus_gemini_key', apiKey);
            } else {
                apiKey = localStorage.getItem('90plus_gemini_key') || '';
            }

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
                alert(`❌ AI 본문 작성 중 에러 발생: ${err.message}\n\n⚠️ Gemini API 한도 초과 또는 오류가 발생했습니다. 직접 기사를 작성할 수 있도록 입력창과 발행 버튼을 활성화합니다.`);
                
                const previewContainer = document.getElementById('ai-preview-container');
                const btnSubmitNews = document.getElementById('btn-submit-news');
                if (previewContainer && btnSubmitNews) {
                    previewContainer.classList.remove('hidden');
                    btnSubmitNews.disabled = false;
                    btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]";
                }
            } finally {
                btnGenerateAi.disabled = false;
                btnGenerateAi.textContent = "🪄 AI 본문 초안 생성 (Gemini)";
                btnGenerateAi.className = "flex-1 bg-teal-500 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98]";
            }
        });
    }

    const btnManualWrite = document.getElementById('btn-manual-write-news');
    if (btnManualWrite) {
        btnManualWrite.addEventListener('click', () => {
            const previewContainer = document.getElementById('ai-preview-container');
            const btnSubmitNews = document.getElementById('btn-submit-news');
            const contentInput = document.getElementById('admin-news-content');
            const summaryInput = document.getElementById('admin-news-summary');
            if (previewContainer && btnSubmitNews) {
                if (contentInput) contentInput.value = '';
                if (summaryInput) summaryInput.value = '';
                previewContainer.classList.remove('hidden');
                btnSubmitNews.disabled = false;
                btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]";
            }
        });
    }

    if (formAdminNews) {
        formAdminNews.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('admin-news-title').value.trim();
            const category = document.getElementById('admin-news-category').value;
            const content = document.getElementById('admin-news-content').value.trim();
            const summaryRaw = document.getElementById('admin-news-summary').value.trim();
            const summary = summaryRaw ? summaryRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
            const nickname = state.user ? (state.user.user_metadata?.nickname || state.user.user_metadata?.name || "90PLUS 기자") : "90PLUS AI";

            const tag = state.selectedNewsTags;

            const richPayload = {
                title: title,
                content: content,
                reporter: nickname,
                tier: 1,
                category: category,
                is_here_we_go: false,
                summary: summary,
                tag: tag
            };

            const jsonString = JSON.stringify(richPayload);

            if (!sbClient) {
                // Offline fallback insertion
                const newArticle = {
                    id: 'offline-news-' + Date.now(),
                    created_at: new Date().toISOString(),
                    title: title,
                    content: content,
                    reporter: nickname,
                    tier: 1,
                    category: category,
                    is_here_we_go: false,
                    summary_points: summary,
                    tag: tag
                };
                const currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
                currentOffline.unshift(newArticle);
                localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));
                
                alert("🏆 [오프라인 모드] 뉴스가 로컬 브라우저에 임시 발행되었습니다!");
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminNews.reset();
                initTagSelectors();
                const previewContainer = document.getElementById('ai-preview-container');
                if (previewContainer) previewContainer.classList.add('hidden');
                
                const btnSubmitNews = document.getElementById('btn-submit-news');
                if (btnSubmitNews) {
                    btnSubmitNews.disabled = true;
                    btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 opacity-50 cursor-not-allowed";
                }
                
                if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
                loadNews();
                return;
            }

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
                initTagSelectors();
                const previewContainer = document.getElementById('ai-preview-container');
                if (previewContainer) previewContainer.classList.add('hidden');
                
                const btnSubmitNews = document.getElementById('btn-submit-news');
                if (btnSubmitNews) {
                    btnSubmitNews.disabled = true;
                    btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 opacity-50 cursor-not-allowed";
                }

                loadNews();
            } catch (err) {
                console.warn("Supabase insert news failed, falling back to offline:", err);
                const newArticle = {
                    id: 'offline-news-' + Date.now(),
                    created_at: new Date().toISOString(),
                    title: title,
                    content: content,
                    reporter: nickname,
                    tier: 1,
                    category: category,
                    is_here_we_go: false,
                    summary_points: summary,
                    tag: tag
                };
                const currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
                currentOffline.unshift(newArticle);
                localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));
                
                alert(`🏆 [발행 실패] 데이터베이스에 뉴스를 발행하지 못했습니다.\n사유: ${err.message || err}\n\n뉴스가 로컬 브라우저에 임시(오프라인)로 발행되었습니다!`);
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminNews.reset();
                initTagSelectors();
                const previewContainer = document.getElementById('ai-preview-container');
                if (previewContainer) previewContainer.classList.add('hidden');
                
                const btnSubmitNews = document.getElementById('btn-submit-news');
                if (btnSubmitNews) {
                    btnSubmitNews.disabled = true;
                    btnSubmitNews.className = "flex-1 bg-brand text-black font-extrabold py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/20 opacity-50 cursor-not-allowed";
                }
                
                if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
                loadNews();
            }
        });
    }

    if (formAdminTransfer) {
        formAdminTransfer.addEventListener('submit', async (e) => {
            e.preventDefault();
            const player = document.getElementById('transfer-player').value.trim();
            const cost = document.getElementById('transfer-cost').value.trim();
            const fromTeam = document.getElementById('transfer-from').value.trim();
            const toTeam = document.getElementById('transfer-to').value.trim();
            const reporter = document.getElementById('transfer-reporter').value.trim();
            const tier = parseInt(document.getElementById('transfer-tier').value, 10);
            const desc = document.getElementById('transfer-desc').value.trim();

            const tag = state.selectedTransferTags;

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
                },
                tag: tag
            };

            const jsonString = JSON.stringify(transferPayload);

            if (!sbClient) {
                // Offline fallback insertion
                const newTransfer = {
                    id: 'offline-transfer-' + Date.now(),
                    created_at: new Date().toISOString(),
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
                    },
                    tag: tag
                };
                const currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
                currentOffline.unshift(newTransfer);
                localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));

                alert("🚨 [오프라인 모드] 이적 정보가 로컬 브라우저에 임시 발행되었습니다!");
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminTransfer.reset();
                initTagSelectors();
                
                if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
                loadNews();
                return;
            }

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
                initTagSelectors();
                loadNews();
            } catch (err) {
                console.warn("Supabase insert transfer failed, falling back to offline:", err);
                const newTransfer = {
                    id: 'offline-transfer-' + Date.now(),
                    created_at: new Date().toISOString(),
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
                    },
                    tag: tag
                };
                const currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
                currentOffline.unshift(newTransfer);
                localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));

                alert(`🚨 [발행 실패] 데이터베이스에 이적 정보를 발행하지 못했습니다.\n사유: ${err.message || err}\n\n이적 정보가 로컬 브라우저에 임시(오프라인)로 발행되었습니다!`);
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminTransfer.reset();
                initTagSelectors();
                
                if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
                loadNews();
            }
        });
    }

    // Form 3: Match Result Submit Handler
    if (formAdminMatchResult) {
        formAdminMatchResult.addEventListener('submit', async (e) => {
            e.preventDefault();
            const league = document.getElementById('match-league').value;
            const round = document.getElementById('match-round').value.trim();
            const home = document.getElementById('match-home-team').value;
            const homeScore = parseInt(document.getElementById('match-home-score').value, 10);
            const away = document.getElementById('match-away-team').value;
            const awayScore = parseInt(document.getElementById('match-away-score').value, 10);
            const comment = document.getElementById('match-comment').value.trim();
            const nickname = state.user ? (state.user.user_metadata?.nickname || state.user.user_metadata?.name || "90PLUS 기록원") : "90PLUS AI";

            const matchResultPayload = {
                title: `${home} ${homeScore} : ${awayScore} ${away}`,
                content: `${league} ${round} 경기 결과 - 홈팀 ${home}와 원정팀 ${away}의 치열한 공방전 끝에 ${homeScore} 대 ${awayScore}로 경기가 마무리되었습니다. ${comment ? `득점 기록: ${comment}` : ''}`,
                reporter: nickname,
                tier: 1,
                category: "경기결과",
                is_match_result: true,
                league,
                round,
                home,
                away,
                homeScore,
                awayScore,
                comment
            };

            const jsonString = JSON.stringify(matchResultPayload);

            if (!sbClient) {
                // Offline fallback insertion
                const newMatch = {
                    id: 'offline-match-' + Date.now(),
                    created_at: new Date().toISOString(),
                    title: `${home} ${homeScore} : ${awayScore} ${away}`,
                    content: `${league} ${round} 경기 결과 - 홈팀 ${home}와 원정팀 ${away}의 치열한 공방전 끝에 ${homeScore} 대 ${awayScore}로 경기가 마무리되었습니다. ${comment ? `득점 기록: ${comment}` : ''}`,
                    reporter: nickname,
                    tier: 1,
                    category: "경기결과",
                    is_match_result: true,
                    league,
                    round,
                    home,
                    away,
                    homeScore,
                    awayScore,
                    comment
                };
                const currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
                currentOffline.unshift(newMatch);
                localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));

                alert("⚽ [오프라인 모드] 경기 결과가 로컬 브라우저에 임시 발행되었습니다!");
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminMatchResult.reset();
                
                if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
                loadNews();
                return;
            }

            try {
                const { error } = await withTimeout(
                    sbClient
                        .from('football_news')
                        .insert({
                            title: jsonString,
                            reporter: nickname,
                            tier: 1,
                            is_here_we_go: false,
                            category: "경기결과"
                        }),
                    3500
                );

                if (error) throw error;

                alert("⚽ 경기 결과가 성공적으로 발행 완료되어 즉시 경기결과 피드에 등록되었습니다!");
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminMatchResult.reset();
                loadNews();
            } catch (err) {
                console.warn("Supabase insert match result failed, falling back to offline:", err);
                const newMatch = {
                    id: 'offline-match-' + Date.now(),
                    created_at: new Date().toISOString(),
                    title: `${home} ${homeScore} : ${awayScore} ${away}`,
                    content: `${league} ${round} 경기 결과 - 홈팀 ${home}와 원정팀 ${away}의 치열한 공방전 끝에 ${homeScore} 대 ${awayScore}로 경기가 마무리되었습니다. ${comment ? `득점 기록: ${comment}` : ''}`,
                    reporter: nickname,
                    tier: 1,
                    category: "경기결과",
                    is_match_result: true,
                    league,
                    round,
                    home,
                    away,
                    homeScore,
                    awayScore,
                    comment
                };
                const currentOffline = JSON.parse(localStorage.getItem('90plus_offline_news') || '[]');
                currentOffline.unshift(newMatch);
                localStorage.setItem('90plus_offline_news', JSON.stringify(currentOffline));

                alert(`⚽ [발행 실패] 데이터베이스에 경기 결과를 발행하지 못했습니다.\n사유: ${err.message || err}\n\n경기 결과가 로컬 브라우저에 임시(오프라인)로 발행되었습니다!`);
                document.getElementById('admin-backdrop').classList.remove('open');
                formAdminMatchResult.reset();
                
                if (offlineSyncChannel) offlineSyncChannel.postMessage({ type: 'sync_news' });
                loadNews();
            }
        });
    }

    // Form 3: AI Smart Match Result Extractor Event Handler
    const btnAiExtractMatch = document.getElementById('btn-ai-extract-match');
    if (btnAiExtractMatch) {
        btnAiExtractMatch.addEventListener('click', async () => {
            const query = document.getElementById('ai-match-query').value.trim();
            
            const keyInputEl = document.getElementById('gemini-api-key');
            let apiKey = keyInputEl ? keyInputEl.value.trim() : '';
            if (apiKey) {
                localStorage.setItem('90plus_gemini_key', apiKey);
            } else {
                apiKey = localStorage.getItem('90plus_gemini_key') || '';
            }

            if (!apiKey) {
                alert("🔑 AI 자동 추출을 사용하려면 먼저 관리자 콘솔 상단에 Gemini API Key를 입력하고 저장해 주세요!");
                return;
            }
            if (!query) {
                alert("🪄 분석할 경기 결과 관련 검색어(예: 어제 아스날 대 리버풀 경기 결과)를 입력해 주세요.");
                return;
            }

            btnAiExtractMatch.disabled = true;
            btnAiExtractMatch.textContent = "추출 중...";
            btnAiExtractMatch.className = "bg-teal-800 text-teal-400 text-xs font-black px-3.5 py-2 rounded-xl cursor-not-allowed";

            try {
                const matchResult = await generateAiMatchResult(apiKey, query);

                // Auto-populate the manual fields!
                const leagueEl = document.getElementById('match-league');
                const roundEl = document.getElementById('match-round');
                const homeEl = document.getElementById('match-home-team');
                const homeScoreEl = document.getElementById('match-home-score');
                const awayEl = document.getElementById('match-away-team');
                const awayScoreEl = document.getElementById('match-away-score');
                const commentEl = document.getElementById('match-comment');

                if (leagueEl && matchResult.league) {
                    const matchesOption = Array.from(leagueEl.options).some(opt => opt.value === matchResult.league);
                    if (matchesOption) leagueEl.value = matchResult.league;
                }
                if (roundEl && matchResult.round) roundEl.value = matchResult.round;
                
                // Align team name selectors
                if (homeEl && matchResult.home) {
                    const matchedOption = Array.from(homeEl.options).find(opt => opt.value.includes(matchResult.home) || matchResult.home.includes(opt.value));
                    if (matchedOption) homeEl.value = matchedOption.value;
                }
                if (awayEl && matchResult.away) {
                    const matchedOption = Array.from(awayEl.options).find(opt => opt.value.includes(matchResult.away) || matchResult.away.includes(opt.value));
                    if (matchedOption) awayEl.value = matchedOption.value;
                }

                if (homeScoreEl && matchResult.homeScore !== undefined) homeScoreEl.value = matchResult.homeScore;
                if (awayScoreEl && matchResult.awayScore !== undefined) awayScoreEl.value = matchResult.awayScore;
                if (commentEl && matchResult.comment) commentEl.value = matchResult.comment;

                alert("🪄 AI가 실시간 구글 검색으로 경기 결과 팩트를 완벽하게 추출하여 하단 입력 폼에 기입했습니다!\n\n내용에 허위 사실이나 오류가 없는지 눈으로 검증 및 수정하신 뒤 [⚽ 경기 결과 등록 발행]을 눌러 최종 발행해 주세요.");
            } catch (err) {
                alert(`❌ AI 경기 결과 자동 추출 실패: ${err.message}\n(입력하신 경기 일정에 대한 정보가 구글 검색에 아직 부재하거나 올바르지 않은 API Key일 수 있습니다.)`);
            } finally {
                btnAiExtractMatch.disabled = false;
                btnAiExtractMatch.textContent = "자동 기입";
                btnAiExtractMatch.className = "bg-brand text-black text-xs font-black px-3.5 py-2 rounded-xl transition-all hover:bg-brand/80 active:scale-95";
            }
        });
    }
}

// 9. UI Rendering & Tab Routers
function setupTabNavigation() {
    const tabs = { 'tab-news': 'news', 'tab-leagues': 'leagues', 'tab-following': 'following' }; // Purged tab-matches
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
    if (btnNotify) {
        btnNotify.addEventListener('click', () => {
            if (!state.user) {
                alert("🔔 알림:\n로그인 후 마이팀 선호 구단을 설정하시면, 실시간 선호팀 소식을 요약 알림으로 신속하게 받아보실 수 있습니다!");
                return;
            }
            const myTeam = state.user.user_metadata?.fav_team;
            if (!myTeam) {
                alert("🔔 알림:\n설정된 선호 구단이 없습니다. 우측 상단 프로필 버튼을 누르고 선호하는 구단을 등록해 보세요!");
                return;
            }

            // Find news matching their favorite team
            const matching = state.newsData.filter(item => 
                (Array.isArray(item.tag) ? item.tag.includes(myTeam) : item.tag === myTeam) ||
                (item.is_match_result && (item.home === myTeam || item.away === myTeam)) ||
                item.title.includes(myTeam) ||
                item.content.includes(myTeam)
            );

            if (matching.length === 0) {
                alert(`🔔 [${myTeam}] 알림:\n현재 등록된 선호팀 관련 최신 소식이 없습니다. 실시간 업데이트가 올라오면 알려드리겠습니다!`);
                return;
            }

            const summaryText = matching.slice(0, 3).map((art, idx) => {
                return `${idx + 1}. [${art.category}] ${art.title} (${getRelativeTime(art.created_at)})`;
            }).join('\n\n');

            alert(`🔔 [${myTeam}] 실시간 알림 피드 요약\n\n최근 업데이트된 소식 총 ${matching.length}건 중 최신 3건:\n\n${summaryText}`);
        });
    }
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            alert("⚙️ 90Plus 설정 & 정보\n\n버전: v2.5.0 (최신 버전)\n개발사: Sportrax AI (스포트랙스 AI)\n\n© 2026 Sportrax AI. All rights reserved.");
        });
    }
}

function renderMainContent() {
    const feed = document.getElementById('tab-content');
    if (!feed) return;
    feed.innerHTML = '';
    
    if (state.currentTab === 'news') renderNewsList(feed);
    else if (state.currentTab === 'following') renderFollowingList(feed);
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

    const myTeam = state.user?.user_metadata?.fav_team || '';

    filtered.forEach(item => {
        const isBookmarked = state.bookmarkedIds.includes(item.id);
        const card = document.createElement('div');
        
        const adminDeleteBtn = state.adminMode 
            ? `<button class="delete-btn text-red-500 hover:text-red-400 font-bold text-xs flex items-center gap-1 p-1 rounded transition-colors" data-id="${item.id}">
                   <span>🗑️</span> 삭제
               </button>`
            : '';

        // Check if article matches user's favorite EPL team (Highlight with lime borders!)
        const isFavTeamMatch = myTeam && (
            (Array.isArray(item.tag) ? item.tag.includes(myTeam) : item.tag === myTeam) ||
            (item.is_match_result && (item.home === myTeam || item.away === myTeam)) ||
            item.title.includes(myTeam) ||
            item.content.includes(myTeam)
        );
        const highlightClass = isFavTeamMatch 
            ? "border-2 border-brand bg-brand/5 shadow-lg shadow-brand/10" 
            : "border border-bordercolor";

        if (item.is_match_result) {
            const homeLogo = teamLogos[item.home];
            const awayLogo = teamLogos[item.away];
            const homeLogoHtml = homeLogo 
                ? `<img src="${homeLogo}" class="w-8 h-8 object-contain bg-white/5 rounded-full p-0.5" alt="${item.home}">` 
                : `<span class="text-xs font-black">🛡️</span>`;
            const awayLogoHtml = awayLogo 
                ? `<img src="${awayLogo}" class="w-8 h-8 object-contain bg-white/5 rounded-full p-0.5" alt="${item.away}">` 
                : `<span class="text-xs font-black">🛡️</span>`;

            card.className = `p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all border border-bordercolor ${isFavTeamMatch ? 'border-2 border-brand shadow-lg shadow-brand/10' : 'glow-border-match'} relative overflow-hidden`;
            card.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <span class="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-extrabold text-[10px]">⚽ ${item.league}</span>
                    <div class="flex items-center gap-1.5">
                        <span class="text-darkgray text-[10px]">${item.round}</span>
                        ${isFavTeamMatch ? `<span class="px-1.5 py-0.5 bg-brand text-black font-extrabold text-[8px] rounded">🌟 My Team</span>` : ''}
                    </div>
                </div>
                
                <div class="flex items-center justify-between py-3 px-1">
                    <!-- 홈 팀 -->
                    <div class="flex flex-col items-center gap-1.5 w-24 text-center">
                        ${homeLogoHtml}
                        <span class="text-xs font-bold text-white truncate max-w-full">${item.home}</span>
                    </div>
                    
                    <!-- 스코어 -->
                    <div class="flex flex-col items-center justify-center">
                        <div class="flex items-center gap-4 text-3xl font-black text-white leading-none">
                            <span class="${item.homeScore > item.awayScore ? 'text-brand' : 'text-white'}">${item.homeScore}</span>
                            <span class="text-xs opacity-30">:</span>
                            <span class="${item.awayScore > item.homeScore ? 'text-brand' : 'text-white'}">${item.awayScore}</span>
                        </div>
                        <span class="text-[9px] bg-darkbg/50 border border-bordercolor/80 text-mutedtext font-bold px-2 py-0.5 rounded-full mt-2">경기 종료</span>
                    </div>
                    
                    <!-- 원정 팀 -->
                    <div class="flex flex-col items-center gap-1.5 w-24 text-center">
                        ${awayLogoHtml}
                        <span class="text-xs font-bold text-white truncate max-w-full">${item.away}</span>
                    </div>
                </div>

                ${item.comment ? `
                <div class="mt-3 bg-darkbg/50 border border-bordercolor/40 rounded-xl p-3 text-[11px] text-mutedtext leading-relaxed">
                    <div class="text-[10px] font-black text-brand mb-1 flex items-center gap-1"><span>📝</span>득점 정보 및 코멘트</div>
                    <div>${item.comment}</div>
                </div>
                ` : ''}
                
                <div class="flex justify-between items-center pt-3.5 mt-3.5 border-t border-bordercolor">
                    <span class="text-xs text-darkgray font-medium">기록원 ${item.reporter} ✓</span>
                    <div class="flex items-center gap-3">
                        ${adminDeleteBtn}
                        <button class="bookmark-btn text-mutedtext" data-id="${item.id}">
                            <svg class="w-5 h-5 ${isBookmarked ? 'fill-brand text-brand' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                    </div>
                </div>
            `;
        } else if (item.is_here_we_go) {
            const fromLogo = item.transfer_info ? teamLogos[item.transfer_info.from] : null;
            const toLogo = item.transfer_info ? teamLogos[item.transfer_info.to] : null;
            
            const fromLogoHtml = fromLogo 
                ? `<img src="${fromLogo}" class="w-6 h-6 object-contain bg-white/5 rounded-full p-0.5" alt="${item.transfer_info.from}">` 
                : `<span class="text-xs font-black">🛡️</span>`;
            const toLogoHtml = toLogo 
                ? `<img src="${toLogo}" class="w-6 h-6 object-contain bg-white/5 rounded-full p-0.5" alt="${item.transfer_info.to}">` 
                : `<span class="text-xs font-black">🛡️</span>`;

            card.className = `p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all relative overflow-hidden ${isFavTeamMatch ? 'border-2 border-brand shadow-lg shadow-brand/10' : 'glow-border-orange'}`;
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-1.5">
                        <span class="px-3 py-1 bg-[#ff9f00]/10 border border-[#ff9f00]/30 rounded-full text-[#ff9f00] font-black text-[10px] pulse-live">🚨 HERE WE GO!</span>
                        ${isFavTeamMatch ? `<span class="px-2 py-0.5 bg-brand text-black font-extrabold text-[9px] rounded-full">🌟 My Team</span>` : ''}
                    </div>
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
            card.className = `p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all ${isTier1 && !isFavTeamMatch ? 'glow-border' : ''} ${highlightClass}`;
            
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
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 uppercase">TIER ${item.tier}</span>
                        ${isFavTeamMatch ? `<span class="px-2 py-0.5 bg-brand text-black font-extrabold text-[9px] rounded-full">🌟 My Team</span>` : ''}
                    </div>
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
    if (!state.user) {
        container.innerHTML = `
            <div class="text-center py-16 bg-cardbg rounded-2xl p-6 border border-bordercolor shadow-xl">
                <span class="text-4xl block mb-4">🌟</span>
                <h3 class="text-white font-extrabold text-base">로그인 후 선호팀 소식을 모아보세요!</h3>
                <p class="text-mutedtext text-xs mt-2 leading-relaxed">회원가입/로그인 후 선호하시는 프리미어리그 팀을 설정하시면,<br>이곳에서 해당 구단의 기사 및 이적 소식만 모아서 편하게 구독할 수 있습니다.</p>
                <button id="btn-login-following-cta" class="mt-6 bg-brand text-black font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]">
                    로그인 및 선호팀 설정하기
                </button>
            </div>
        `;
        const btnCta = document.getElementById('btn-login-following-cta');
        if (btnCta) {
            btnCta.addEventListener('click', () => {
                const backdrop = document.getElementById('auth-backdrop');
                if (backdrop) backdrop.classList.add('open');
            });
        }
        return;
    }

    const myTeam = state.user.user_metadata?.fav_team || '';
    if (!myTeam) {
        container.innerHTML = `
            <div class="text-center py-16 bg-cardbg rounded-2xl p-6 border border-bordercolor shadow-xl">
                <div class="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-4">
                    <span class="text-xl font-bold">⚽</span>
                </div>
                <h3 class="text-white font-extrabold text-base">선호하는 구단을 등록해 주세요</h3>
                <p class="text-mutedtext text-xs mt-2 leading-relaxed">아직 선호팀을 등록하지 않으셨습니다.<br>우측 상단의 프로필 버튼을 누르고 선호하는 프리미어리그 팀을 등록해 보세요!</p>
                <button id="btn-profile-following-cta" class="mt-6 bg-brand text-black font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]">
                    구단 등록 창 열기
                </button>
            </div>
        `;
        const btnCta = document.getElementById('btn-profile-following-cta');
        if (btnCta) {
            btnCta.addEventListener('click', () => {
                const backdrop = document.getElementById('auth-backdrop');
                if (backdrop) backdrop.classList.add('open');
            });
        }
        return;
    }

    // Filter news tagged with myTeam or containing myTeam in title/content
    const myTeamNews = state.newsData.filter(item => {
        // Tag check (from database JSON payload)
        const hasTagMatch = Array.isArray(item.tag) ? item.tag.includes(myTeam) : item.tag === myTeam;
        
        // Match result team check
        const isMatchTeam = item.is_match_result && (item.home === myTeam || item.away === myTeam);
        
        // Text fallback
        const hasTextMatch = item.title.includes(myTeam) || item.content.includes(myTeam);
        
        return hasTagMatch || isMatchTeam || hasTextMatch;
    });

    if (myTeamNews.length === 0) {
        const logoUrl = teamLogos[myTeam];
        const logoHtml = logoUrl 
            ? `<img src="${logoUrl}" class="w-12 h-12 object-contain mx-auto mb-4" alt="${myTeam}">`
            : `<span class="text-4xl block mb-4">🛡️</span>`;

        container.innerHTML = `
            <div class="text-center py-16 bg-cardbg rounded-2xl p-6 border border-bordercolor">
                ${logoHtml}
                <h3 class="text-white font-extrabold text-base">${myTeam}의 새 소식이 아직 없습니다</h3>
                <p class="text-mutedtext text-xs mt-1.5 leading-relaxed">구단과 연동된 최신 뉴스나 이적 정보를 저널리스트들이 준비 중입니다.<br>잠시만 기다려 주세요!</p>
            </div>
        `;
        return;
    }

    // Apply category filtering for Following feed
    let filtered = myTeamNews;
    if (state.activeNewsCategory === '이적소식') {
        filtered = myTeamNews.filter(item => item.is_here_we_go || item.category === '이적소식');
    } else if (state.activeNewsCategory === '경기결과') {
        filtered = myTeamNews.filter(item => item.category === '경기결과');
    }

    const myTeamLogo = teamLogos[myTeam];
    const headerHtml = `
        <div class="flex items-center gap-3 bg-darkbg/40 border border-bordercolor rounded-2xl p-4 mb-2">
            ${myTeamLogo ? `<img src="${myTeamLogo}" class="w-10 h-10 object-contain bg-white/5 rounded-full p-0.5" alt="${myTeam}">` : ''}
            <div>
                <h4 class="text-white font-black text-sm">${myTeam} 팔로잉 피드</h4>
                <p class="text-mutedtext text-[10px] mt-0.5">응원하는 '${myTeam}'의 모든 소식과 이적 정보를 실시간 모아봅니다.</p>
            </div>
        </div>
    `;

    if (filtered.length === 0) {
        container.innerHTML = headerHtml + `
            <div class="text-center py-16 bg-cardbg rounded-2xl p-6 border border-bordercolor mt-4">
                <span class="text-3xl block mb-3">📭</span>
                <h3 class="text-white font-extrabold text-sm">${myTeam}의 ${state.activeNewsCategory} 소식이 없습니다.</h3>
                <p class="text-mutedtext text-xs mt-1.5 leading-relaxed">다른 카테고리를 선택하거나 나중에 다시 확인해 주세요!</p>
            </div>
        `;
        return;
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col gap-4";
    wrapper.innerHTML = headerHtml;

    filtered.forEach(item => {
        const isBookmarked = state.bookmarkedIds.includes(item.id);
        const card = document.createElement('div');
        const highlightClass = "border-2 border-brand bg-brand/5 shadow-lg shadow-brand/10";
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

            card.className = `p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all relative overflow-hidden ${highlightClass}`;
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-1.5">
                        <span class="px-3 py-1 bg-[#ff9f00]/10 border border-[#ff9f00]/30 rounded-full text-[#ff9f00] font-black text-[10px] pulse-live">🚨 HERE WE GO!</span>
                        <span class="px-2 py-0.5 bg-brand text-black font-extrabold text-[9px] rounded-full">🌟 My Team</span>
                    </div>
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
            card.className = `p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all ${highlightClass}`;
            
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
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 uppercase">TIER ${item.tier}</span>
                        <span class="px-2 py-0.5 bg-brand text-black font-extrabold text-[9px] rounded-full">🌟 My Team</span>
                    </div>
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

        wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
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

    let matchSection = '';
    if (item.is_match_result) {
        const homeLogo = teamLogos[item.home];
        const awayLogo = teamLogos[item.away];
        const homeLogoHtml = homeLogo ? `<img src="${homeLogo}" class="w-12 h-12 object-contain bg-white/5 rounded-full p-1" alt="${item.home}">` : `🛡️`;
        const awayLogoHtml = awayLogo ? `<img src="${awayLogo}" class="w-12 h-12 object-contain bg-white/5 rounded-full p-1" alt="${item.away}">` : `🛡️`;

        matchSection = `
            <div class="flex items-center justify-around bg-darkbg/70 border border-bordercolor rounded-2xl p-5 mb-6 text-sm font-bold text-white">
                <div class="flex flex-col items-center gap-1.5 w-24 text-center">
                    ${homeLogoHtml}
                    <span class="text-xs text-mutedtext mt-1">홈 팀</span>
                    <span class="truncate max-w-full text-xs font-extrabold">${item.home}</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-2xl font-black text-white flex items-center gap-3">
                        <span class="${item.homeScore > item.awayScore ? 'text-brand' : 'text-white'}">${item.homeScore}</span>
                        <span class="text-xs opacity-30">:</span>
                        <span class="${item.awayScore > item.homeScore ? 'text-brand' : 'text-white'}">${item.awayScore}</span>
                    </div>
                    <span class="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full mt-2">종료</span>
                </div>
                <div class="flex flex-col items-center gap-1.5 w-24 text-center">
                    ${awayLogoHtml}
                    <span class="text-xs text-mutedtext mt-1">원정 팀</span>
                    <span class="truncate max-w-full text-xs font-extrabold">${item.away}</span>
                </div>
            </div>
            <div class="bg-darkbg/50 border border-bordercolor rounded-xl p-3.5 mb-6 flex justify-between items-center text-xs font-bold">
                <span class="text-mutedtext">🏆 대회 및 라운드</span>
                <span class="text-brand text-xs font-black">${item.league} — ${item.round}</span>
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
        ${matchSection}
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

// 9. Supabase Realtime Synchronization Module
function setupRealtimeSync() {
    if (!sbClient) return;
    
    // Subscribe to Postgres changes on 'football_news' table
    sbClient
        .channel('public:football_news')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'football_news'
            },
            (payload) => {
                console.log('Realtime database change detected:', payload);
                loadNews();
            }
        )
        .subscribe();
}

// 9.1 User Profile Management APIs
async function loadUserProfiles() {
    const tbody = document.getElementById('admin-user-list-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-mutedtext">불러오는 중...</td></tr>';
    
    const warningEl = document.getElementById('admin-user-sync-warning');
    if (warningEl) {
        warningEl.classList.add('hidden');
        warningEl.innerHTML = '';
    }

    let profiles = [];
    const offlineUsers = JSON.parse(localStorage.getItem('90plus_offline_users') || '[]');
    
    // Ensure adminofficial is in offline users list
    const hasAdmin = offlineUsers.some(u => u.nickname.toLowerCase() === 'adminofficial');
    if (!hasAdmin) {
        offlineUsers.push({ id: 'admin-fixed-id', nickname: 'adminofficial', role: 'admin', fav_team: '' });
        localStorage.setItem('90plus_offline_users', JSON.stringify(offlineUsers));
    }

    if (sbClient) {
        try {
            const { data, error } = await sbClient
                .from('profiles')
                .select('*');
            if (error) throw error;
            profiles = data || [];
            
            // Merge profiles with offline profiles just in case
            const profileIds = new Set(profiles.map(p => p.id));
            offlineUsers.forEach(u => {
                if (!profileIds.has(u.id)) {
                    profiles.push(u);
                }
            });

            if (warningEl) {
                warningEl.innerHTML = `<span>●</span> 실시간 계정 동기화: 데이터베이스 연결 완료`;
                warningEl.className = "bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold";
                warningEl.classList.remove('hidden');
            }
        } catch(e) {
            console.warn("Supabase profiles fetch failed, fallback to local users:", e);
            profiles = offlineUsers;
            if (warningEl) {
                warningEl.innerHTML = `<span>●</span> 실시간 계정 동기화: 로컬 저장소 모드 (사유: ${e.message || e})`;
                warningEl.className = "bg-amber-950/30 border border-amber-500/20 text-amber-400 text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold";
                warningEl.classList.remove('hidden');
            }
        }
    } else {
        profiles = offlineUsers;
        if (warningEl) {
            warningEl.innerHTML = `<span>●</span> 실시간 계정 동기화: 오프라인 보관소 모드`;
            warningEl.className = "bg-teal-950/30 border border-teal-500/20 text-teal-400 text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold";
            warningEl.classList.remove('hidden');
        }
    }

    if (profiles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-mutedtext">가입된 회원이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = profiles.map(user => {
        const isMe = state.user && (
            state.user.id === user.id || 
            state.user.user_metadata?.nickname === user.nickname
        );
        
        const roleLabel = user.role === 'admin' ? '관리자' : '일반회원';
        const roleBadgeColor = user.role === 'admin' ? 'bg-brand/20 text-brand border-brand/30' : 'bg-mutedtext/10 text-mutedtext border-bordercolor';
        
        const toggleRoleBtn = isMe 
            ? '' 
            : `<button onclick="window.manageToggleRole('${user.id}', '${user.nickname}', '${user.role}')" class="text-xs bg-cardbg hover:bg-cardhover border border-bordercolor hover:border-brand/40 px-2.5 py-1.5 rounded text-white transition-colors">
                   권한 변경
               </button>`;
        
        const deleteBtn = isMe 
            ? '<span class="text-mutedtext font-medium text-[10px] pr-2">본인</span>' 
            : `<button onclick="window.manageDeleteUser('${user.id}', '${user.nickname}')" class="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1.5 rounded text-red-400 transition-colors ml-1.5">
                   탈퇴
               </button>`;

        return `
            <tr class="border-b border-bordercolor/30 hover:bg-cardhover/20 transition-colors">
                <td class="py-3 pr-2 font-bold">${user.nickname}</td>
                <td class="py-3 px-2">
                    <span class="px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadgeColor}">${roleLabel}</span>
                </td>
                <td class="py-3 px-2 text-mutedtext">${user.fav_team || '없음'}</td>
                <td class="py-3 pl-2 text-right">
                    <div class="inline-flex items-center">
                        ${toggleRoleBtn}
                        ${deleteBtn}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.manageToggleRole = async function(userId, nickname, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`👤 '${nickname}' 회원의 권한을 '${newRole === 'admin' ? '관리자' : '일반회원'}'(으)로 변경하시겠습니까?`)) return;

    // Update Local Storage
    const offlineUsers = JSON.parse(localStorage.getItem('90plus_offline_users') || '[]');
    const localUser = offlineUsers.find(u => u.id === userId || u.nickname === nickname);
    if (localUser) {
        localUser.role = newRole;
        localStorage.setItem('90plus_offline_users', JSON.stringify(offlineUsers));
    }

    let dbSuccess = true;
    let dbErrorMsg = "";

    // Update Supabase profiles table
    if (sbClient) {
        try {
            const { error } = await sbClient
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);
            if (error) throw error;
        } catch(e) {
            console.warn("Supabase profiles table role update failed:", e);
            dbSuccess = false;
            dbErrorMsg = e.message || e;
        }
    }

    if (dbSuccess) {
        alert(`👤 '${nickname}' 회원의 권한이 성공적으로 변경되었습니다.`);
    } else {
        alert(`⚠️ [데이터베이스 연동 실패] '${nickname}' 회원의 권한이 로컬 기기에서만 임시 변경되었습니다.\n서버 에러: ${dbErrorMsg}`);
    }
    loadUserProfiles();
};

window.manageDeleteUser = async function(userId, nickname) {
    if (!confirm(`⚠️ 정말로 '${nickname}' 회원을 강제 탈퇴 처리하시겠습니까? 회원의 가입 정보가 완전히 제거됩니다.`)) return;

    // Update Local Storage
    let offlineUsers = JSON.parse(localStorage.getItem('90plus_offline_users') || '[]');
    offlineUsers = offlineUsers.filter(u => u.id !== userId && u.nickname !== nickname);
    localStorage.setItem('90plus_offline_users', JSON.stringify(offlineUsers));

    let dbSuccess = true;
    let dbErrorMsg = "";

    // Update Supabase profiles table
    if (sbClient) {
        try {
            const { error } = await sbClient
                .from('profiles')
                .delete()
                .eq('id', userId);
            if (error) throw error;
        } catch(e) {
            console.warn("Supabase profiles table user deletion failed:", e);
            dbSuccess = false;
            dbErrorMsg = e.message || e;
        }
    }

    if (dbSuccess) {
        alert(`🗑️ '${nickname}' 회원이 완전히 탈퇴 처리되었습니다.`);
    } else {
        alert(`⚠️ [데이터베이스 연동 실패] '${nickname}' 회원이 로컬 기기에서만 임시 탈퇴되었습니다.\n서버 에러: ${dbErrorMsg}`);
    }
    loadUserProfiles();
};

// 9.2 Initialize Multi-select Tag selectors
function initTagSelectors() {
    const newsContainer = document.getElementById('admin-news-tags-container');
    const transferContainer = document.getElementById('transfer-tags-container');
    
    const eplTeams = [
        "아스날", "맨시티", "맨유", "애스턴 빌라", "리버풀", "본머스", "선덜랜드", 
        "브라이턴", "브렌트퍼드", "첼시", "풀럼", "뉴캐슬", "에버턴", "리즈 유나이티드", 
        "크리스털 팰리스", "노팅엄 포레스트", "토트넘", "웨스트 햄", "번리", "울브스"
    ];

    state.selectedNewsTags = [];
    state.selectedTransferTags = [];

    const buildBadges = (container, selectedArray) => {
        if (!container) return;
        container.innerHTML = '';
        eplTeams.forEach(team => {
            const badge = document.createElement('button');
            badge.type = 'button';
            badge.className = "px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-bordercolor text-mutedtext hover:text-white transition-all";
            badge.textContent = team;
            badge.onclick = () => {
                const index = selectedArray.indexOf(team);
                if (index === -1) {
                    selectedArray.push(team);
                    badge.className = "px-2.5 py-1 rounded-lg text-[10px] font-black border border-brand bg-brand text-black transition-all shadow-md shadow-brand/10";
                } else {
                    selectedArray.splice(index, 1);
                    badge.className = "px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-bordercolor text-mutedtext hover:text-white transition-all";
                }
            };
            container.appendChild(badge);
        });
    };

    buildBadges(newsContainer, state.selectedNewsTags);
    buildBadges(transferContainer, state.selectedTransferTags);
}

// 10. App Entry Point
document.addEventListener('DOMContentLoaded', () => {
    // Pre-seed offline admin profile if not exists
    const offlineUsers = JSON.parse(localStorage.getItem('90plus_offline_users') || '[]');
    const hasAdmin = offlineUsers.some(u => u.nickname.toLowerCase() === 'adminofficial');
    if (!hasAdmin) {
        offlineUsers.push({
            id: 'admin-fixed-id',
            nickname: 'adminofficial',
            role: 'admin',
            fav_team: ''
        });
        localStorage.setItem('90plus_offline_users', JSON.stringify(offlineUsers));
    }

    // Initializing SPA Routers & Event Listeners
    setupTabNavigation();
    setupSearch();
    setupBottomSheet();
    setupAuthEvents();
    setupAdminPanelEvents();
    initTagSelectors();
    
    // Initializing Supabase Auth & Session listener
    initAuth();

    // Setup Realtime Sync
    setupRealtimeSync();
    
    // Fetch news from Supabase database
    loadNews();
});
