(function() {
  const key = 'site-dark-mode';
  const toggle = document.getElementById('dark-mode-toggle');
  const root = document.documentElement; // <html>

  const isDark = localStorage.getItem(key) === 'on';
  root.classList.toggle('dark-mode', isDark);
  toggle.textContent = isDark ? '☀️' : '🌙';

  toggle.addEventListener('click', () => {
    const now = root.classList.toggle('dark-mode');
    localStorage.setItem(key, now ? 'on' : 'off');
    toggle.textContent = now ? '☀️' : '🌙';
  });
})();
