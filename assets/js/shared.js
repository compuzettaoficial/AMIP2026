/* ========================================
   FUNCIONES COMPARTIDAS ENTRE PÁGINAS
======================================== */

// ========================================
// NAVEGACIÓN MÓVIL
// ========================================
function toggleMenu() {
    const nav = document.getElementById('nav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

function closeMenu() {
    const nav = document.getElementById('nav');
    if (nav) {
        nav.classList.remove('active');
    }
}

// ========================================
// CERRAR MENÚ AL HACER CLIC FUERA
// ========================================
document.addEventListener('click', (e) => {
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (nav && menuToggle && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// ========================================
// SMOOTH SCROLL PARA ENLACES INTERNOS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                closeMenu();
            }
        }
    });
});
