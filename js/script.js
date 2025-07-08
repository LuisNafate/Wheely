const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle');

sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});