/* ========================================
   JAVASCRIPT ESPECÍFICO DE INDEX.HTML
======================================== */

// ========================================
// BOTÓN VOLVER ARRIBA
// ========================================
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    // Mostrar/ocultar botón según scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // Scroll al hacer clic
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    });
}
