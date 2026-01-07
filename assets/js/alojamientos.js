// VARIABLES GLOBALES
let alojamientos = [];
let currentModalSlide = 0;
let currentImages = [];

// ========================================
// CARGAR DATOS
// ========================================
async function loadData() {
    try {
        const response = await fetch('data/alojamientos.json');
        alojamientos = await response.json();
        
        console.log('✅ Alojamientos cargados:', alojamientos.length);
        applyFilters();
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        document.getElementById('cardsGrid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar datos</h3>
                <p>Verifica que el archivo "data/alojamientos.json" existe</p>
            </div>
        `;
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
        filtered = filtered.filter(a => a.tipo === tipo);
    }
    
    // Búsqueda
    const search = document.getElementById('filter-search').value.toLowerCase();
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
    
    const img = alojamiento.imagenes?.[0] || '';
    const whatsapp = isHotel ? alojamiento.contacto?.whatsapp : alojamiento.whatsapp;
    const telefono = isHotel ? alojamiento.contacto?.telefono : alojamiento.telefono;
    
    // Features
    let features = [];
    if (alojamiento.accesible) features.push('<span class="feature-badge highlight"><i class="fas fa-wheelchair"></i> Accesible</span>');
    if (alojamiento.estacionamiento?.tiene) features.push(`<span class="feature-badge"><i class="fas fa-parking"></i> ${alojamiento.estacionamiento.tipo}</span>`);
    if (alojamiento.promocion?.tienePromocion) features.push('<span class="feature-badge highlight"><i class="fas fa-tags"></i> Promo</span>');
    
    return `
        <div class="card" onclick="showDetail('${alojamiento.nombre.replace(/'/g, "\\'")}')">
            <div class="card-badge ${isHotel ? '' : 'cochera'}">
                ${isHotel ? 'HOTEL' : 'COCHERA'}
            </div>
            
            ${img ? `
            <div class="card-img-container">
                <img src="${img}" alt="${alojamiento.nombre}" class="card-img" onerror="this.style.display='none'">
                <button class="card-share" onclick="shareAlojamiento(event, '${alojamiento.nombre.replace(/'/g, "\\'")}')">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>` : ''}
            
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
                    ${!isHotel && alojamiento.capacidad ? `
                    <div class="card-info-item">
                        <i class="fas fa-car"></i>
                        <span>Capacidad: ${alojamiento.capacidad} vehículos</span>
                    </div>` : ''}
                </div>
                
                <div class="card-price">
                    S/ ${price}
                    ${isHotel ? '' : '<small>/día</small>'}
                    ${originalPrice ? `<span class="price-original">S/ ${originalPrice}</span>` : ''}
                    ${alojamiento.promocion?.tienePromocion ? '<span class="promo-tag">PROMO</span>' : ''}
                </div>
                
                <div class="card-actions">
                    ${whatsapp ? `
                    <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" class="btn btn-secondary" onclick="event.stopPropagation()" target="_blank">
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
        });
    }
}

// ========================================
// MODAL DETALLE
// ========================================
function showDetail(nombre) {
    const alojamiento = alojamientos.find(a => a.nombre === nombre);
    if (!alojamiento) return;
    
    const isHotel = alojamiento.tipo === 'hotel';
    
    document.getElementById('modalTitle').textContent = alojamiento.nombre;
    
    // Carrusel de imágenes
    currentImages = alojamiento.imagenes || [];
    currentModalSlide = 0;
    
    if (currentImages.length > 0) {
        document.getElementById('modalCarousel').style.display = 'block';
        document.getElementById('modalCarouselImages').innerHTML = currentImages.map(img => 
            `<img src="${img}" alt="${alojamiento.nombre}" onerror="this.style.display='none'">`
        ).join('');
        updateModalCounter();
    } else {
        document.getElementById('modalCarousel').style.display = 'none';
    }
    
    // Contenido
    let bodyHTML = '';
    
    // Información general
    bodyHTML += `
        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Información</h3>
            <p><strong>Dirección:</strong> ${alojamiento.direccion} 
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alojamiento.direccion + ' Nuevo Chimbote')}" target="_blank">
                    <i class="fas fa-map-marker-alt"></i> Ver en mapa
                </a>
            </p>
            ${alojamiento.distanciaAproximada ? `<p><strong>Distancia:</strong> ${alojamiento.distanciaAproximada}</p>` : ''}
            ${!isHotel && alojamiento.capacidad ? `<p><strong>Capacidad:</strong> ${alojamiento.capacidad} vehículos</p>` : ''}
            ${alojamiento.accesible ? '<p><i class="fas fa-wheelchair"></i> <strong>Accesible para personas con silla de ruedas</strong></p>' : ''}
            ${alojamiento.estacionamiento?.tiene ? `<p><i class="fas fa-parking"></i> <strong>Estacionamiento ${alojamiento.estacionamiento.tipo}</strong></p>` : ''}
        </div>
    `;
    
    // Precios
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
            </div>
        `;
    } else {
        bodyHTML += `
            <div class="info-section">
                <h3><i class="fas fa-dollar-sign"></i> Tarifas</h3>
                <p><strong>Por día:</strong> S/ ${alojamiento.precioDia}</p>
                ${alojamiento.precioNoche ? `<p><strong>Por noche:</strong> S/ ${alojamiento.precioNoche}</p>` : ''}
            </div>
        `;
    }
    
    // Servicios
    if (isHotel && alojamiento.servicios?.length) {
        bodyHTML += `
            <div class="info-section">
                <h3><i class="fas fa-concierge-bell"></i> Servicios</h3>
                <div class="servicios-list">
                    ${alojamiento.servicios.map(s => `<div class="servicio-item">${s}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Contacto
    const contacto = isHotel ? alojamiento.contacto : alojamiento;
    bodyHTML += `
        <div class="info-section">
            <h3><i class="fas fa-phone"></i> Contacto</h3>
            ${contacto.telefono ? `<p>📞 <a href="tel:${contacto.telefono}">${contacto.telefono}</a></p>` : ''}
            ${contacto.whatsapp ? `<p>💬 <a href="https://wa.me/${contacto.whatsapp.replace(/[^0-9]/g, '')}" target="_blank">${contacto.whatsapp}</a></p>` : ''}
            ${contacto.email ? `<p>✉️ <a href="mailto:${contacto.email}">${contacto.email}</a></p>` : ''}
            ${contacto.facebook ? `<p>📘 <a href="${contacto.facebook}" target="_blank">Facebook</a></p>` : ''}
            ${contacto.web ? `<p>🌐 <a href="${contacto.web}" target="_blank">Sitio Web</a></p>` : ''}
        </div>
    `;
    
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
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
    document.getElementById('modalCounter').textContent = 
        `${currentModalSlide + 1} / ${currentImages.length}`;
}

// ========================================
// FILTROS MÓVIL
// ========================================
function toggleFilters() {
    document.getElementById('filtersSidebar').classList.toggle('active');
}

// Cerrar modal al hacer clic fuera
document.getElementById('detailModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') closeModal();
});

// Cerrar filtros móvil al hacer clic fuera
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('filtersSidebar');
    const filterToggle = document.querySelector('.mobile-filters-toggle');
    
    if (sidebar && filterToggle && sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && !filterToggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// Tecla ESC para cerrar modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ========================================
// INICIALIZACIÓN
// ========================================
loadData();
