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

// ========================================
// BOTÓN VOLVER ARRIBA (TODAS LAS PÁGINAS)
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

console.log('✅ shared.js cargado correctamente');
/* ========================================
   DROPDOWN MENU
======================================== */
function toggleDropdown(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const menu = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    // Cerrar todos los otros dropdowns
    document.querySelectorAll('.nav-dropdown-menu.active').forEach(m => {
        if (m !== menu) {
            m.classList.remove('active');
            m.previousElementSibling.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Toggle el dropdown actual
    if (isExpanded) {
        menu.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
    } else {
        menu.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
    }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
            menu.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
    }
});

// Cerrar dropdown al presionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.nav-dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
            menu.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
    }
});

console.log('✅ Dropdown menu inicializado');
