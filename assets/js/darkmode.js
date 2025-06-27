(function() {
  const btn = document.getElementById('dark-mode-toggle');
  const storeKey = 'jekyll-dark-mode';

  // Apply saved preference on load
  const darkModeOn = localStorage.getItem(storeKey) === 'on';
  document.body.classList.toggle('dark-mode', darkModeOn);
  btn.textContent = darkModeOn ? '☀️' : '🌙';

  // Click handler
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem(storeKey, isDark ? 'on' : 'off');
    btn.textContent = isDark ? '☀️' : '🌙';
  });
})();
