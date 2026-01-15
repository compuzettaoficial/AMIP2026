// VARIABLES GLOBALES
let alojamientos = [];
let currentModalSlide = 0;
let currentImages = [];

console.log('✅ alojamientos.js cargado');

// ========================================
// CARGAR DATOS
// ========================================
async function loadData() {
    try {
        const response = await fetch('data/alojamientos.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        alojamientos = await response.json();
        
        console.log('✅ Alojamientos cargados:', alojamientos.length);
        applyFilters();
        
        // 🆕 DETECTAR PARÁMETRO URL Y ABRIR MODAL
        detectarHotelEnURL();
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        document.getElementById('cardsGrid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar datos</h3>
                <p>No se pudo cargar la información de alojamientos.</p>
                <p style="font-size: 0.9rem; margin-top: 1rem;">Verifica que el archivo "data/alojamientos.json" existe y es válido.</p>
            </div>
        `;
    }
}

// 🆕 DETECTAR HOTEL EN URL Y ABRIR MODAL
function detectarHotelEnURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelParam = urlParams.get('hotel');
    
    if (hotelParam) {
        console.log('🔍 Hotel detectado en URL:', hotelParam);
        
        // Buscar el hotel en los datos
        const hotel = alojamientos.find(a => a.nombre === hotelParam);
        
        if (hotel) {
            console.log('✅ Hotel encontrado, abriendo modal...');
            
            // Esperar un poco para que se rendericen las cards
            setTimeout(() => {
                showDetail(hotel.nombre);
            }, 500);
        } else {
            console.warn('⚠️ Hotel no encontrado:', hotelParam);
        }
    }
}

// ========================================
// FILTROS
// ========================================
function applyFilters() {
    let filtered = [...alojamientos];
    
    // Tipo
    const tipo = document.getElementById('filter-tipo').value;
    if (tipo !== 'todos') {
        if (tipo === 'cochera') {
            filtered = filtered.filter(a => 
                a.tipo === 'cochera' || (a.tipo === 'hotel' && a.estacionamiento?.tiene === true)
            );
        } else {
            filtered = filtered.filter(a => a.tipo === tipo);
        }
    }
    
    // Búsqueda
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    if (search) {
        filtered = filtered.filter(a => 
            a.nombre.toLowerCase().includes(search) ||
            a.direccion.toLowerCase().includes(search)
        );
    }
    
    // Precio
    const maxPrice = parseInt(document.getElementById('filter-precio').value);
    filtered = filtered.filter(a => {
        const price = getPrice(a);
        return price <= maxPrice;
    });
    
    // Promoción
    if (document.getElementById('filter-promo').checked) {
        filtered = filtered.filter(a => a.promocion?.tienePromocion);
    }
    
    // Estacionamiento
    if (document.getElementById('filter-estacionamiento').checked) {
        filtered = filtered.filter(a => a.estacionamiento?.tiene);
    }
    
    // Accesible
    if (document.getElementById('filter-accesible').checked) {
        filtered = filtered.filter(a => a.accesible);
    }
    
    // Ordenar
    const sort = document.getElementById('sort-options').value;
    filtered.sort((a, b) => {
        if (sort === 'precio-asc') return getPrice(a) - getPrice(b);
        if (sort === 'precio-desc') return getPrice(b) - getPrice(a);
        if (sort === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
        if (sort === 'nombre-desc') return b.nombre.localeCompare(a.nombre);
        return 0;
    });
    
    renderCards(filtered);
    
    // Scroll automático a los resultados después de filtrar (solo en móvil)
    if (window.innerWidth <= 1024) {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

function resetFilters() {
    document.getElementById('filter-tipo').value = 'hotel';
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-precio').value = '9999';
    document.getElementById('sort-options').value = 'precio-asc';
    document.getElementById('filter-promo').checked = false;
    document.getElementById('filter-estacionamiento').checked = false;
    document.getElementById('filter-accesible').checked = false;
    applyFilters();
}

function getPrice(alojamiento) {
    if (alojamiento.tipo === 'cochera') {
        return alojamiento.precioDia || 0;
    }
    if (alojamiento.promocion?.tienePromocion && alojamiento.promocion.preciosEvento) {
        return alojamiento.promocion.preciosEvento.simple || 0;
    }
    return alojamiento.precios?.simple || 0;
}

// ========================================
// CARGAR MÚLTIPLES IMÁGENES
// ========================================
function loadAllImages(nombre, imagenPrincipal, esHotelConCochera = false) {
    if (!imagenPrincipal) return [];
    
    const images = [imagenPrincipal];
    const baseName = imagenPrincipal.replace(/\.[^/.]+$/, '');
    const ext = imagenPrincipal.split('.').pop();
    
    if (esHotelConCochera) {
        const cocheraImg = `${baseName}-cochera.${ext}`;
        images.push(cocheraImg);
    }
    
    for (let i = 2; i <= 10; i++) {
        const imgPath = `${baseName}-${i}.${ext}`;
        images.push(imgPath);
    }
    
    return images;
}

function getCocheraImage(alojamiento) {
    if (alojamiento.tipo !== 'hotel' || !alojamiento.imagenes?.[0]) {
        return alojamiento.imagenes?.[0] || '';
    }
    
    const imgPrincipal = alojamiento.imagenes[0];
    const baseName = imgPrincipal.replace(/\.[^/.]+$/, '');
    const ext = imgPrincipal.split('.').pop();
    
    return `${baseName}-cochera.${ext}`;
}

// ========================================
// RENDERIZAR TARJETAS
// ========================================
function renderCards(list) {
    const grid = document.getElementById('cardsGrid');
    const count = document.getElementById('resultsCount');
    
    count.textContent = list.length;
    
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = list.map(a => createCard(a)).join('');
}

function createCard(alojamiento) {
    const isHotel = alojamiento.tipo === 'hotel';
    const price = getPrice(alojamiento);
    const originalPrice = (alojamiento.promocion?.tienePromocion && alojamiento.precios?.simple) 
        ? alojamiento.precios.simple : null;
    
    const whatsapp = isHotel ? alojamiento.contacto?.whatsapp : alojamiento.whatsapp;
    const telefono = isHotel ? alojamiento.contacto?.telefono : alojamiento.telefono;
    
    const tipoFiltro = document.getElementById('filter-tipo').value;
    const mostrarComoCochera = isHotel && alojamiento.estacionamiento?.tiene && tipoFiltro === 'cochera';
    
    let img = alojamiento.imagenes?.[0] || '';
    if (mostrarComoCochera) {
        const cocheraImg = getCocheraImage(alojamiento);
        img = cocheraImg;
    }
    
    let features = [];
    if (alojamiento.accesible) features.push('<span class="feature-badge highlight"><i class="fas fa-wheelchair"></i> Accesible</span>');
    
    if (mostrarComoCochera) {
        features.push(`<span class="feature-badge highlight"><i class="fas fa-parking"></i> ${alojamiento.estacionamiento.tipo}</span>`);
        if (isHotel) {
            features.push('<span class="feature-badge highlight"><i class="fas fa-hotel"></i> Incluye hospedaje</span>');
        }
    } else {
        if (alojamiento.estacionamiento?.tiene) features.push(`<span class="feature-badge highlight"><i class="fas fa-parking"></i> ${alojamiento.estacionamiento.tipo}</span>`);
    }
    
    if (alojamiento.promocion?.tienePromocion) features.push('<span class="feature-badge highlight"><i class="fas fa-tags"></i> Promo</span>');
    
    const nombreEscapado = alojamiento.nombre.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    let badgeText = 'HOTEL';
    let badgeClass = '';
    
    if (mostrarComoCochera) {
        badgeText = '🏨 HOTEL CON ESTACIONAMIENTO';
        badgeClass = 'hotel-cochera';
    } else if (alojamiento.tipo === 'cochera') {
        badgeText = 'COCHERA';
        badgeClass = 'cochera';
    }
    
    let infoCochera = '';
    if (mostrarComoCochera) {
        const precioHotel = alojamiento.promocion?.tienePromocion && alojamiento.promocion.preciosEvento 
            ? alojamiento.promocion.preciosEvento.simple 
            : alojamiento.precios?.simple || 0;
        
        infoCochera = `
            <div class="card-info-item" style="background: #dbeafe; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                <i class="fas fa-info-circle"></i>
                <span><strong>Estacionamiento incluido</strong> al hospedarse (desde S/ ${precioHotel}/noche)</span>
            </div>
        `;
    }
    
    return `
        <div class="card" onclick="showDetail('${nombreEscapado}')">
            <div class="card-badge ${badgeClass}">
                ${badgeText}
            </div>
            
            <div class="card-img-container">
                ${img ? `<img src="${img}" alt="${alojamiento.nombre}" class="card-img" loading="lazy" onerror="this.onerror=null; this.src='${alojamiento.imagenes?.[0] || ''}'">` : ''}
                ${img ? `<button class="card-share" onclick="shareAlojamiento(event, '${nombreEscapado}')" aria-label="Compartir">
                    <i class="fas fa-share-alt"></i>
                </button>` : ''}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${alojamiento.nombre}</h3>
                
                ${features.length > 0 ? `<div class="card-features">${features.join('')}</div>` : ''}
                
                <div class="card-info">
                    <div class="card-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${alojamiento.direccion}</span>
                    </div>
                    ${alojamiento.distanciaAproximada ? `
                    <div class="card-info-item">
                        <i class="fas fa-walking"></i>
                        <span>${alojamiento.distanciaAproximada}</span>
                    </div>` : ''}
                    ${infoCochera}
                </div>
                
                <div class="card-price">
                    ${mostrarComoCochera ? 
                        `Desde S/ ${alojamiento.precios?.simple || 0}<small>/noche con estacionamiento</small>` :
                        `S/ ${price}${isHotel ? '' : '<small>/día</small>'}`
                    }
                    ${originalPrice && !mostrarComoCochera ? `<span class="price-original">S/ ${originalPrice}</span>` : ''}
                    ${alojamiento.promocion?.tienePromocion && !mostrarComoCochera ? '<span class="promo-tag">PROMO</span>' : ''}
                </div>
                
                <div class="card-actions">
                    ${whatsapp ? `
                    <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" class="btn btn-secondary" onclick="event.stopPropagation()" target="_blank" rel="noopener">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>` : ''}
                    ${telefono ? `
                    <a href="tel:${telefono}" class="btn btn-primary" onclick="event.stopPropagation()">
                        <i class="fas fa-phone"></i> Llamar
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ========================================
// COMPARTIR
// ========================================
function shareAlojamiento(event, nombre) {
    event.stopPropagation();
    
    const alojamiento = alojamientos.find(a => a.nombre === nombre);
    if (!alojamiento) return;
    
    const text = `${alojamiento.nombre} - Convención AMIP 2026\n${alojamiento.direccion}`;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: alojamiento.nombre,
            text: text,
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            alert('✓ Enlace copiado al portapapeles');
        }).catch(() => {
            alert('No se pudo copiar el enlace');
        });
    }
}
// ========================================
// MODAL DETALLE
// ========================================
async function showDetail(nombre) {
    const alojamiento = alojamientos.find(a => a.nombre === nombre);
    if (!alojamiento) return;
    
    const isHotel = alojamiento.tipo === 'hotel';
    const tipoFiltro = document.getElementById('filter-tipo').value;
    const esHotelConCochera = isHotel && alojamiento.estacionamiento?.tiene;
    
    document.getElementById('modalTitle').textContent = alojamiento.nombre;
    
    const imagenPrincipal = alojamiento.imagenes?.[0] || '';
    if (imagenPrincipal) {
        const todasLasImagenes = loadAllImages(alojamiento.nombre, imagenPrincipal, esHotelConCochera);
        const imagenesExistentes = await verificarImagenes(todasLasImagenes);
        currentImages = imagenesExistentes;
    } else {
        currentImages = [];
    }
    
    currentModalSlide = 0;
    
    const carousel = document.getElementById('modalCarousel');
    if (currentImages.length > 0) {
        carousel.style.display = 'block';
        document.getElementById('modalCarouselImages').innerHTML = currentImages.map(img => 
            `<img src="${img}" alt="${alojamiento.nombre}" loading="lazy" onerror="this.style.display='none'">`
        ).join('');
        updateModalCounter();
        
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        if (currentImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    } else {
        carousel.style.display = 'none';
    }
    
    let bodyHTML = '';
    
    bodyHTML += `
        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Información</h3>
            <p><strong>Dirección:</strong> ${alojamiento.direccion} 
                <a href="${alojamiento.urlMaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alojamiento.direccion + ' Nuevo Chimbote')}`}" target="_blank" rel="noopener">
                    <i class="fas fa-map-marker-alt"></i> Ver en mapa
                </a>
            </p>
            ${alojamiento.distanciaAproximada ? `<p><strong>Distancia:</strong> ${alojamiento.distanciaAproximada}</p>` : ''}
            ${!isHotel && alojamiento.capacidad ? `<p><strong>Capacidad:</strong> ${alojamiento.capacidad} vehículos</p>` : ''}
            ${alojamiento.accesible ? '<p><i class="fas fa-wheelchair"></i> <strong>Accesible para personas con silla de ruedas</strong></p>' : ''}
        </div>
    `;
    
    if (isHotel && alojamiento.estacionamiento?.tiene) {
        bodyHTML += `
            <div class="info-section" style="background: #dbeafe; border-left: 4px solid var(--primary);">
                <h3><i class="fas fa-parking"></i> Estacionamiento del Hotel</h3>
                <p><strong>Tipo:</strong> ${alojamiento.estacionamiento.tipo}</p>
                <p><strong>✅ INCLUIDO PARA HUÉSPEDES</strong> - No tiene costo adicional al hospedarse</p>
                <p style="font-size: 0.95rem; opacity: 0.9;">El estacionamiento está disponible sin cargo extra para quienes se hospedan en el hotel.</p>
            </div>
        `;
    }
    
    if (isHotel) {
        const precios = alojamiento.promocion?.tienePromocion && alojamiento.promocion.preciosEvento 
            ? alojamiento.promocion.preciosEvento : alojamiento.precios;
        
        bodyHTML += `
            <div class="info-section">
                <h3><i class="fas fa-dollar-sign"></i> Precios por noche</h3>
                ${alojamiento.promocion?.tienePromocion ? `
                <p style="background: #fef3c7; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>🎉 Promoción AMIP 2026</strong> 
                    ${alojamiento.promocion.codigo ? '- Código: ' + alojamiento.promocion.codigo : ''}
                </p>` : ''}
                <div class="info-grid">
                    <div class="info-item">
                        <i class="fas fa-bed"></i>
                        <span><strong>Simple:</strong> S/ ${precios.simple}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-bed"></i>
                        <span><strong>Doble:</strong> S/ ${precios.doble}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-bed"></i>
                        <span><strong>Matrimonial:</strong> S/ ${precios.matrimonial}</span>
                    </div>
                </div>
                ${alojamiento.estacionamiento?.tiene ? 
                    '<p style="font-size: 0.9rem; margin-top: 1rem; color: var(--success);"><i class="fas fa-check-circle"></i> <strong>Estacionamiento incluido en todas las tarifas</strong></p>' 
                    : ''}
            </div>
        `;
    } else {
        bodyHTML += `
            <div class="info-section">
                <h3><i class="fas fa-dollar-sign"></i> Tarifas</h3>
                <p><strong>Por día:</strong> S/ ${alojamiento.precioDia}</p>
                ${alojamiento.precioNoche ? `<p><strong>Por noche:</strong> S/ ${alojamiento.precioNoche}</p>` : ''}
                ${alojamiento.horario ? `<p><strong>Horario:</strong> ${alojamiento.horario}</p>` : ''}
            </div>
        `;
    }
    
    if (alojamiento.servicios?.length) {
        bodyHTML += `
            <div class="info-section">
                <h3><i class="fas fa-concierge-bell"></i> Servicios</h3>
                <div class="servicios-list">
                    ${alojamiento.servicios.map(s => `<div class="servicio-item">${s}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    const contacto = isHotel ? alojamiento.contacto : alojamiento;
    bodyHTML += `
        <div class="info-section">
            <h3><i class="fas fa-phone"></i> Contacto</h3>
            ${contacto.telefono ? `<p>📞 <a href="tel:${contacto.telefono}">${contacto.telefono}</a></p>` : ''}
            ${contacto.whatsapp ? `<p>💬 <a href="https://wa.me/${contacto.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener">${contacto.whatsapp}</a></p>` : ''}
            ${contacto.email ? `<p>✉️ <a href="mailto:${contacto.email}">${contacto.email}</a></p>` : ''}
            ${contacto.facebook ? `<p>📘 <a href="${contacto.facebook}" target="_blank" rel="noopener">Facebook</a></p>` : ''}
            ${contacto.web ? `<p>🌐 <a href="${contacto.web}" target="_blank" rel="noopener">Sitio Web</a></p>` : ''}
        </div>
    `;
    
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function verificarImagenes(imagenes) {
    const promesas = imagenes.map(img => 
        new Promise(resolve => {
            const testImg = new Image();
            testImg.onload = () => resolve(img);
            testImg.onerror = () => resolve(null);
            testImg.src = img;
        })
    );
    
    const resultados = await Promise.all(promesas);
    return resultados.filter(img => img !== null);
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========================================
// CARRUSEL MODAL
// ========================================
function slideModalCarousel(direction) {
    if (currentImages.length === 0) return;
    
    currentModalSlide = (currentModalSlide + direction + currentImages.length) % currentImages.length;
    
    const container = document.getElementById('modalCarouselImages');
    container.style.transform = `translateX(-${currentModalSlide * 100}%)`;
    
    updateModalCounter();
}

function updateModalCounter() {
    const counter = document.getElementById('modalCounter');
    if (currentImages.length > 0) {
        counter.textContent = `${currentModalSlide + 1} / ${currentImages.length}`;
    }
}

// ========================================
// FILTROS MÓVIL
// ========================================
function toggleFilters() {
    const sidebar = document.getElementById('filtersSidebar');
    if (sidebar) {
        const isActive = sidebar.classList.toggle('active');
        
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

const detailModal = document.getElementById('detailModal');
if (detailModal) {
    detailModal.addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') {
            closeModal();
        }
    });
}

document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('filtersSidebar');
    const filterToggle = document.querySelector('.mobile-filters-toggle');
    
    if (sidebar && filterToggle && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !filterToggle.contains(e.target)) {
            toggleFilters();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('detailModal');
        if (modal && modal.classList.contains('active')) {
            closeModal();
        }
        
        const sidebar = document.getElementById('filtersSidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            toggleFilters();
        }
    }
});

// ========================================
// INICIALIZACIÓN
// ========================================
loadData();
