/* ========================================
   FUNCIONES COMPARTIDAS ENTRE PÁGINAS
======================================== */

// ========================================
// NAVEGACIÓN MÓVIL
// ========================================
function toggleMenu() {
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    
    if (nav) {
        const isActive = nav.classList.toggle('active');
        
        // Actualizar estado del botón toggle
        if (menuToggle) {
            menuToggle.classList.toggle('active', isActive);
        }
        
        // Controlar scroll del body
        if (isActive) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
        
        console.log('Menú:', isActive ? 'Abierto' : 'Cerrado');
    }
}

// Asegurar que closeMenu también resetea correctamente
function closeMenu() {
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    
    if (nav) {
        nav.classList.remove('active');
        
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
        
        body.style.overflow = 'auto';
    }
}

console.log('✅ Corrección de menú mobile aplicada');

// ========================================
// CERRAR MENÚ AL HACER CLIC FUERA
// ========================================
document.addEventListener('click', (e) => {
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (nav && menuToggle && nav.classList.contains('active')) {
        // Si el clic no fue dentro del nav ni en el botón toggle
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    }
});

// ========================================
// CERRAR MENÚ CON TECLA ESC
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const nav = document.getElementById('nav');
        if (nav && nav.classList.contains('active')) {
            closeMenu();
        }
    }
});

// ========================================
// SMOOTH SCROLL PARA ENLACES INTERNOS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignorar enlaces vacíos o solo "#"
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                // Cerrar menú móvil si está abierto
                closeMenu();
                
                // Scroll suave al elemento
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ========================================
// MEJORAR ACCESIBILIDAD: FOCUS TRAP EN MENÚ MÓVIL
// ========================================
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

// Aplicar focus trap cuando el menú se abre
const nav = document.getElementById('nav');
if (nav) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                // Enfocar el primer enlace cuando se abre el menú
                const firstLink = nav.querySelector('a');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        });
    });
    
    observer.observe(nav, { attributes: true, attributeFilter: ['class'] });
}

console.log('✅ shared.js cargado correctamente');
