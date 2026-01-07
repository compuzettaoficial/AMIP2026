/* ========================================
   JAVASCRIPT ESPECÍFICO DE INDEX.HTML
======================================== */

// NAVEGACIÓN
function toggleMenu() {
    document.getElementById('nav').classList.toggle('active');
}

function closeMenu() {
    document.getElementById('nav').classList.remove('active');
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (nav && menuToggle && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// Smooth scroll para enlaces internos
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
            }
        }
    });
});

// BOTÓN VOLVER ARRIBA
window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
