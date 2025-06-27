document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle');
  const icon = document.getElementById('dark-icon');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  });
});
