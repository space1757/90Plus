// Compact Mock Data for UI Demos
export const mockNews = [
    {
        id: 'mock-1',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        is_here_we_go: true,
        title: "빅토르 오시멘",
        transfer_info: { from: "SSC 나폴리", to: "파리 생제르맹", cost: "€120M + 보너스" },
        reporter: "Fabrizio Romano",
        tier: 1,
        category: "이적소식",
        content: "빅토르 오시멘과 파리 생제르맹 간의 개인 조건 협상이 완료되었습니다. 계약 기간은 5년이며, 연봉은 세후 €12m으로 책정되었습니다. 나폴리와 PSG 간 이적료 협상이 최종 타결되었으며 선수는 메디컬 테스트를 진행합니다."
    },
    {
        id: 'mock-2',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_here_we_go: false,
        title: "손흥민, 토트넘과 2027년까지 재계약 임박... 주급 상승 예상",
        reporter: "The Athletic",
        tier: 1,
        category: "최신뉴스",
        content: "토트넘 홋스퍼가 손흥민과 2027년까지 계약 연장을 위한 협상을 진행 중입니다. 새로운 계약에는 기존 대비 상당한 주급 인상이 포함되며, 포스테코글루 감독은 손흥민을 핵심 리더로 평가해 재계약을 강력히 요청했습니다.",
        summary_points: [
            "토트넘 홋스퍼가 손흥민과 2027년까지 계약 연장 협상 중.",
            "새로운 계약에는 큰 폭의 주급 인상 혜택 포함 전망.",
            "포스테코글루 감독은 손흥민의 구단 내 영향력을 높게 평가함."
        ]
    },
    {
        id: 'mock-3',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_here_we_go: false,
        title: "맨체스터 시티 3-3 아스날 | 전술 분석 리포트",
        reporter: "Michael Cox",
        tier: 2,
        category: "전술분석",
        tactic_grade: {
            managerA: { name: "펩 과르디올라", grade: "A+" },
            managerB: { name: "미켈 아르테타", grade: "B+" }
        },
        tactic_summary: "🏆 3-2-5 빌드업 ➔ 4-3-3 공격 전환",
        content: "펩 과르디올라 감독의 가변 3백 시스템이 아스날의 고강도 전방 압박을 무력화시켰습니다. 후반전 로드리 투입 이후 맨시티의 중원 장악력이 현저히 상승하며 흐름을 완전히 뒤바꾸었습니다."
    }
];

export const mockMatches = {
    25: [
        { league: "프리미어리그", leagueId: "EPL", status: "LIVE", time: "67'", home: "맨유", away: "리버풀", homeScore: 2, awayScore: 1, stats: { shots: 12, possession: 58 }, highlight: true },
        { league: "프리미어리그", leagueId: "EPL", status: "FT", time: "종료", home: "맨시티", away: "아스날", homeScore: 3, awayScore: 3, stats: { shots: 18, possession: 50 }, highlight: false },
        { league: "프리미어리그", leagueId: "EPL", status: "SCHEDULED", time: "23:00", home: "첼시", away: "토트넘", homeScore: "-", awayScore: "-", stats: null, highlight: false },
        { league: "라리가", leagueId: "LALIGA", status: "LIVE", time: "82'", home: "바르샤", away: "레알", homeScore: 4, awayScore: 2, stats: { shots: 12, possession: 58 }, highlight: true }
    ]
};

export const mockStandings = [
    { rank: 1, team: "리버풀", played: 28, win: 20, draw: 5, loss: 3, gd: 35, pts: 65, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: "아스날", played: 28, win: 18, draw: 6, loss: 4, gd: 29, pts: 60, form: ['W', 'D', 'W', 'W', 'L'] },
    { rank: 3, team: "맨시티", played: 28, win: 17, draw: 7, loss: 4, gd: 31, pts: 58, form: ['D', 'W', 'L', 'W', 'W'] },
    { rank: 4, team: "첼시", played: 28, win: 14, draw: 8, loss: 6, gd: 15, pts: 50, form: ['W', 'D', 'W', 'D', 'D'] },
    { rank: 5, team: "토트넘", played: 28, win: 14, draw: 5, loss: 9, gd: 12, pts: 47, form: ['L', 'W', 'W', 'L', 'W'] }
];
