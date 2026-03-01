// js/theme.js
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);

    // Update toggle button icon
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.textContent = targetTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Check local storage or system preference on load
(function () {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

// Initialize button after DOM load
document.addEventListener("DOMContentLoaded", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        btn.addEventListener('click', toggleTheme);
    }
});
