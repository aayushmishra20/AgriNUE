window.addEventListener("scroll", reveal);

function reveal(){

var reveals = document.querySelectorAll(".reveal");

for(var i=0;i<reveals.length;i++){

var windowHeight = window.innerHeight;
var elementTop = reveals[i].getBoundingClientRect().top;
var visible = 150;

if(elementTop < windowHeight - visible){

reveals[i].classList.add("active");

}

}

}
document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Scroll Reveal Logic ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.15 });

    const hiddenElements = document.querySelectorAll(".reveal");
    hiddenElements.forEach((el) => observer.observe(el));

    // --- 2. Auth Visibility Logic ---
    const profileItem = document.getElementById('profile-item');
    const loginItem = document.getElementById('login-item');

    // Check if the user has a token in LocalStorage
    const userToken = localStorage.getItem('userToken');

    if (userToken) {
        // User is Logged In
        if (profileItem) profileItem.classList.remove('hidden');
        if (loginItem) loginItem.classList.add('hidden');
    } else {
        // User is a Guest
        if (profileItem) profileItem.classList.add('hidden');
        if (loginItem) loginItem.classList.remove('hidden');
    }
});
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Icons
    if (window.lucide) lucide.createIcons();

    // 2. Handle Auth State
    const userToken = localStorage.getItem('userToken');
    const profileItem = document.getElementById('profile-item');
    const loginItem = document.getElementById('login-item');

    if (userToken) {
        profileItem?.classList.remove('hidden');
        loginItem?.classList.add('hidden');
    }

    // 3. Highlight Active Page
    const currentPage = window.location.pathname.split("/").pop() || 'home.html';
    const navMap = {
        'home.html': 'nav-home',
        'report.html': 'nav-report',
        'overview.html': 'nav-dash',
        'analysis.html': 'nav-analyze'
    };
    const activeId = navMap[currentPage];
    if (activeId) document.getElementById(activeId)?.classList.add('active');

    // 4. Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        lucide.createIcons();
    });
});