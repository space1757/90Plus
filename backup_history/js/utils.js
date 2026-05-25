// Relative Time Calculator
export function getRelativeTime(dateString) {
    const diffMs = new Date() - new Date(dateString);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
}

// Local Storage Bookmark Manager
export function saveBookmarks(bookmarkedIds) {
    localStorage.setItem('90plus_bookmarks', JSON.stringify(bookmarkedIds));
}
