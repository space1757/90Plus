import { state, updateState } from './config.js';
import { mockMatches, mockStandings } from './mockData.js';
import { getRelativeTime, saveBookmarks } from './utils.js';
import { loadNews } from './api.js';

// Setup foot navigation tabs
export function setupTabNavigation() {
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
                updateState('currentTab', tabName);
                renderTopNav();
                renderMainContent();
            });
        }
    });
}

// Render Top Scroll Bar (Chips / Dates)
export function renderTopNav() {
    const navContent = document.getElementById('top-nav-content');
    if (!navContent) return;
    navContent.innerHTML = '';

    if (state.currentTab === 'news' || state.currentTab === 'following') {
        const categories = ['최신뉴스', '이적소식', '경기결과', '전술분석'];
        categories.forEach(cat => {
            const button = document.createElement('button');
            const isActive = state.activeNewsCategory === cat;
            button.className = `px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${isActive ? 'border-brand text-brand bg-brand/10' : 'border-bordercolor text-mutedtext hover:text-white'}`;
            button.textContent = cat;
            button.addEventListener('click', () => {
                updateState('activeNewsCategory', cat);
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
                updateState('selectedDate', day.d);
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

// Search & Actions Setup
export function setupSearch() {
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
            const query = e.target.value.trim().toLowerCase();
            updateState('searchQuery', query);
            if (btnClear) {
                if (query.length > 0) btnClear.classList.remove('hidden');
                else btnClear.classList.add('hidden');
            }
            renderMainContent();
        });

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                searchInput.value = '';
                updateState('searchQuery', '');
                btnClear.classList.add('hidden');
                renderMainContent();
                searchInput.focus();
            });
        }
    }

    // Header Mock Actions
    const btnNotify = document.getElementById('btn-notify');
    const btnSettings = document.getElementById('btn-settings');
    if (btnNotify) btnNotify.addEventListener('click', () => alert("🔔 알림: 오늘 올라온 이적 속보를 확인하세요!"));
    if (btnSettings) btnSettings.addEventListener('click', () => alert("⚙️ 설정: 90plus 프리미엄 버전 1.2.0"));
}

// Bookmark Toggle Integration
export function toggleBookmark(id, event) {
    if (event) event.stopPropagation();
    const index = state.bookmarkedIds.indexOf(id);
    if (index === -1) {
        state.bookmarkedIds.push(id);
    } else {
        state.bookmarkedIds.splice(index, 1);
    }
    saveBookmarks(state.bookmarkedIds);
    renderMainContent();
}

// Main Tab Router
export function renderMainContent() {
    const feed = document.getElementById('tab-content');
    if (!feed) return;
    feed.innerHTML = '';
    
    if (state.currentTab === 'news') renderNewsList(feed);
    else if (state.currentTab === 'following') renderFollowingList(feed);
    else if (state.currentTab === 'matches') renderMatchesList(feed);
    else if (state.currentTab === 'leagues') renderLeaguesList(feed);
}

// News List Layout Renderer
function renderNewsList(container) {
    let filtered = state.newsData;
    if (state.activeNewsCategory === '이적소식') {
        filtered = state.newsData.filter(item => item.is_here_we_go || item.category === '이적소식');
    } else if (state.activeNewsCategory === '전술분석') {
        filtered = state.newsData.filter(item => item.category === '전술분석' || item.tactic_grade);
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
        container.innerHTML = `<div class="text-center py-16 text-mutedtext"><p class="text-sm">해당 축구 뉴스가 없습니다.</p></div>`;
        return;
    }

    filtered.forEach(item => {
        const isBookmarked = state.bookmarkedIds.includes(item.id);
        const card = document.createElement('div');
        
        if (item.is_here_we_go) {
            card.className = "glow-border-orange p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all relative overflow-hidden";
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <span class="px-3 py-1 bg-[#ff9f00]/10 border border-[#ff9f00]/30 rounded-full text-[#ff9f00] font-black text-[10px] pulse-live">🚨 HERE WE GO!</span>
                    <span class="text-darkgray text-[11px]">${getRelativeTime(item.created_at)}</span>
                </div>
                <h3 class="text-2xl font-black text-white leading-tight mb-2">${item.title}</h3>
                <p class="text-sm text-mutedtext leading-relaxed line-clamp-3 mb-4">${item.content}</p>
                <div class="flex justify-between items-center pt-3.5 border-t border-bordercolor">
                    <span class="text-xs text-white font-bold">FR ${item.reporter} ✓</span>
                    <button class="bookmark-btn text-mutedtext" data-id="${item.id}">
                        <svg class="w-5 h-5 ${isBookmarked ? 'fill-brand text-brand' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                </div>
            `;
        } else if (item.tactic_grade) {
            card.className = "p-5 rounded-2xl bg-cardbg border border-bordercolor cursor-pointer hover:bg-cardhover transition-all relative";
            card.innerHTML = `
                <div class="pitch-bg rounded-xl p-4 mb-4 flex flex-col justify-between items-center h-28 relative">
                    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] border-b border-dashed border-[#143b29]"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full pitch-center-circle"></div>
                    <div class="flex justify-around w-full z-10"><span class="w-2.5 h-2.5 bg-brand rounded-full"></span><span class="w-2.5 h-2.5 bg-brand rounded-full"></span><span class="w-2.5 h-2.5 bg-brand rounded-full"></span></div>
                    <div class="absolute bottom-2 left-3 bg-brand/10 border border-brand/35 rounded-full px-2 py-0.5 text-[9px] text-brand font-black">⚽ AI 전술 분석</div>
                    <span class="absolute right-3 bottom-2 text-darkgray text-[10px]">${getRelativeTime(item.created_at)}</span>
                </div>
                <h3 class="text-base font-extrabold text-white leading-snug mb-3.5">${item.title}</h3>
                <div class="flex gap-2 mb-3.5">
                    <div class="flex-1 bg-darkbg/70 border border-bordercolor/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-mutedtext"><span>${item.tactic_grade.managerA.name}</span><span class="w-6 h-6 bg-brand/15 text-brand rounded-full flex items-center justify-center text-[10px] font-black">${item.tactic_grade.managerA.grade}</span></div>
                    <div class="flex-1 bg-darkbg/70 border border-bordercolor/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-mutedtext"><span>${item.tactic_grade.managerB.name}</span><span class="w-6 h-6 bg-teal-500/15 text-teal-400 rounded-full flex items-center justify-center text-[10px] font-black">${item.tactic_grade.managerB.grade}</span></div>
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-bordercolor">
                    <span class="text-xs text-mutedtext">✍️ ${item.reporter}</span>
                    <button class="bookmark-btn text-mutedtext" data-id="${item.id}">
                        <svg class="w-5 h-5 ${isBookmarked ? 'fill-brand text-brand' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                </div>
            `;
        } else {
            const isTier1 = item.tier === 1;
            card.className = `${isTier1 ? 'glow-border' : 'border border-bordercolor'} p-5 rounded-2xl bg-cardbg cursor-pointer hover:bg-cardhover transition-all`;
            
            let summaryHtml = '';
            if (item.summary_points && item.summary_points.length > 0) {
                summaryHtml = `
                    <div class="mt-3 bg-darkbg/50 border border-bordercolor/50 rounded-xl p-3 text-xs">
                        <div class="text-brand font-black mb-1.5 flex items-center gap-1 text-[10px]"><span>🪄</span>AI 요약</div>
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
                    <button class="bookmark-btn text-mutedtext" data-id="${item.id}">
                        <svg class="w-5 h-5 ${isBookmarked ? 'fill-brand text-brand' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                </div>
            `;
        }

        // Bookmark Click Event
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                toggleBookmark(item.id, e);
            });
        }

        // Open Drawer Click Event (Avoid triggering when bookmark button is clicked)
        card.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) return;
            openBottomSheet(item);
        });
        
        container.appendChild(card);
    });
}

// Following Saved List Renderer
function renderFollowingList(container) {
    const bookmarkedNews = state.newsData.filter(item => state.bookmarkedIds.includes(item.id));
    if (bookmarkedNews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20 bg-cardbg rounded-2xl p-6">
                <h3 class="text-white font-bold text-base">팔로잉된 소식이 없습니다</h3>
                <p class="text-mutedtext text-xs mt-1.5">뉴스의 하트 아이콘을 누르면 이곳에 모입니다.</p>
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

// Match List Renderer
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
                <h4 class="text-sm font-extrabold text-white">프리미어리그 & 라리가</h4>
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
            statHtml = `<div class="mt-4 pt-3.5 border-t border-bordercolor/50 flex justify-between text-[10px] text-mutedtext font-bold"><span>슈팅 ${match.stats.shots}</span><span>점유율 ${match.stats.possession}%</span><span class="text-brand">상세</span></div>`;
        }

        card.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <span class="${match.status === 'LIVE' ? 'bg-brand text-black pulse-live' : 'bg-gray-800 text-mutedtext'} text-[9px] font-black px-2 py-0.5 rounded">${match.time}</span>
            </div>
            <div class="flex items-center justify-between px-2">
                <div class="flex flex-col items-center gap-1.5 w-16">
                    <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">H</div>
                    <span class="text-xs font-bold text-white truncate max-w-full">${match.home}</span>
                </div>
                <div class="flex items-center gap-4 text-2xl font-black text-white">
                    <span>${match.homeScore}</span>
                    <span class="text-xs opacity-40">:</span>
                    <span>${match.awayScore}</span>
                </div>
                <div class="flex flex-col items-center gap-1.5 w-16">
                    <div class="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-xs">A</div>
                    <span class="text-xs font-bold text-white truncate max-w-full">${match.away}</span>
                </div>
            </div>
            ${statHtml}
        `;
        cardContainer.appendChild(card);
    });
}

// Leagues Table Renderer
function renderLeaguesList(container) {
    const tableDiv = document.createElement('div');
    tableDiv.className = "bg-cardbg border border-bordercolor rounded-2xl overflow-hidden shadow-xl";
    let tableRows = mockStandings.map(team => `
        <tr class="border-b border-bordercolor/60 hover:bg-cardhover/30 transition-colors">
            <td class="px-3.5 py-3 text-center text-xs font-black text-white">${team.rank}</td>
            <td class="px-2 py-3 flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold border border-brand/20">🛡️</div>
                <span class="text-xs font-bold text-white">${team.team}</span>
            </td>
            <td class="px-2 py-3 text-center text-xs text-mutedtext">${team.played}</td>
            <td class="px-2 py-3 text-center text-xs text-mutedtext font-semibold">${team.gd > 0 ? `+${team.gd}` : team.gd}</td>
            <td class="px-2 py-3 text-center text-xs font-extrabold text-white">${team.pts}</td>
        </tr>
    `).join('');

    tableDiv.innerHTML = `
        <div class="px-4.5 py-4 border-b border-bordercolor">
            <span class="text-sm font-extrabold text-white">🏆 프리미어리그 2025/2026 순위표</span>
        </div>
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-darkbg/40 border-b border-bordercolor text-[10px] text-mutedtext uppercase">
                    <th class="px-3.5 py-3 text-center w-12">순위</th>
                    <th class="px-2 py-3">팀</th>
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

// Drawer Settings
export function setupBottomSheet() {
    const backdrop = document.getElementById('backdrop');
    const sheet = document.getElementById('bottom-sheet');
    if (backdrop && sheet) {
        const close = () => { sheet.classList.remove('open'); backdrop.classList.remove('open'); };
        backdrop.addEventListener('click', close);
        const dragBtn = document.getElementById('btn-close-sheet-drag');
        if (dragBtn) dragBtn.addEventListener('click', close);
    }
}

// Open Details Drawer
export function openBottomSheet(item) {
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

    container.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="text-[9px] font-black px-2.5 py-1 bg-brand/10 border border-brand/35 rounded text-brand uppercase">${item.category}</span>
            <span class="text-darkgray text-xs">${getRelativeTime(item.created_at)}</span>
        </div>
        <h2 class="text-xl font-black text-white leading-snug mb-5">${item.title}</h2>
        ${summarySection}
        <div class="text-sm text-gray-200 leading-relaxed mb-8 whitespace-pre-line">${item.content}</div>
        <div class="flex justify-between items-center py-4 border-t border-bordercolor">
            <div>
                <span class="text-xs text-white font-extrabold block">${item.reporter}</span>
                <span class="text-[9px] text-darkgray">기자 신뢰도: TIER ${item.tier}</span>
            </div>
            <div class="flex gap-2">
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

    document.getElementById('btn-bookmark-modal').addEventListener('click', () => {
        toggleBookmark(item.id);
        sheet.classList.remove('open');
        backdrop.classList.remove('open');
    });

    document.getElementById('btn-share-modal').addEventListener('click', () => {
        navigator.clipboard.writeText(`[90plus] ${item.title}\n\n${item.content}`);
        alert("📋 기사 공유용 텍스트가 클립보드에 복사되었습니다!");
    });

    sheet.classList.add('open');
    backdrop.classList.add('open');
}
