/* ========================================
   JAVASCRIPT ESPECÍFICO DE INDEX.HTML
======================================== */

console.log('✅ index.js cargado correctamente');

// ========================================
// CARGAR HOTELES CON PROMOCIÓN
// ========================================
async function cargarHotelesConPromocion() {
    try {
        const response = await fetch('data/alojamientos.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const alojamientos = await response.json();
        
        // Filtrar solo hoteles con promoción activa
        const hotelesConPromo = alojamientos.filter(a => 
            a.tipo === 'hotel' && 
            a.promocion?.tienePromocion === true
        );
        
        console.log('Hoteles con promoción encontrados:', hotelesConPromo.length);
        
        if (hotelesConPromo.length > 0) {
            renderHotelesPromo(hotelesConPromo);
            // Mostrar la sección
            document.getElementById('hoteles-promo').style.display = 'block';
        } else {
            // Ocultar la sección si no hay promociones
            document.getElementById('hoteles-promo').style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ Error cargando hoteles con promoción:', error);
        // Ocultar la sección en caso de error
        document.getElementById('hoteles-promo').style.display = 'none';
    }
}

// ========================================
// RENDERIZAR HOTELES CON PROMOCIÓN
// ========================================
function renderHotelesPromo(hoteles) {
    const grid = document.getElementById('hotelesPromoGrid');
    
    if (!grid) {
        console.error('No se encontró el elemento hotelesPromoGrid');
        return;
    }
    
    grid.innerHTML = hoteles.map(hotel => crearCardHotelPromo(hotel)).join('');
}

function crearCardHotelPromo(hotel) {
    const precioNormal = hotel.precios?.simple || 0;
    const precioPromo = hotel.promocion?.preciosEvento?.simple || precioNormal;
    const descuentoPorcentaje = Math.round(((precioNormal - precioPromo) / precioNormal) * 100);
    
    const imagen = hotel.imagenes?.[0] || '';
    const whatsapp = hotel.contacto?.whatsapp || '';
    const telefono = hotel.contacto?.telefono || '';
    
    // Features destacados
    let features = [];
    if (hotel.estacionamiento?.tiene) {
        features.push(`<span class="hotel-promo-feature"><i class="fas fa-parking"></i> Estacionamiento ${hotel.estacionamiento.tipo}</span>`);
    }
    if (hotel.accesible) {
        features.push(`<span class="hotel-promo-feature"><i class="fas fa-wheelchair"></i> Accesible</span>`);
    }
    if (hotel.servicios?.includes('Desayuno incluido') || hotel.servicios?.includes('Desayuno buffet incluido')) {
        features.push(`<span class="hotel-promo-feature"><i class="fas fa-coffee"></i> Desayuno incluido</span>`);
    }
    
    const nombreEscapado = hotel.nombre.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    // URL encode para parámetro
    const nombreURL = encodeURIComponent(hotel.nombre);
    
    return `
        <div class="hotel-promo-card">
            <div class="hotel-promo-badge">
                ${descuentoPorcentaje}% OFF
            </div>
            
            <div class="hotel-promo-image">
                ${imagen ? `<img src="${imagen}" alt="${hotel.nombre}" loading="lazy" onerror="this.style.display='none'">` : ''}
            </div>
            
            <div class="hotel-promo-content">
                <h3 class="hotel-promo-title">${hotel.nombre}</h3>
                
                ${hotel.distanciaAproximada ? `
                <div class="hotel-promo-ubicacion">
                    <i class="fas fa-walking"></i>
                    <span>${hotel.distanciaAproximada}</span>
                </div>` : ''}
                
                ${features.length > 0 ? `
                <div class="hotel-promo-features">
                    ${features.join('')}
                </div>` : ''}
                
                <div class="hotel-promo-pricing">
                    ${hotel.promocion.codigo ? `
                    <div class="hotel-promo-codigo">
                        <i class="fas fa-tag"></i> Código: ${hotel.promocion.codigo}
                    </div>` : ''}
                    
                    <div class="hotel-promo-prices">
                        <span class="hotel-promo-price-new">S/ ${precioPromo}</span>
                        <span class="hotel-promo-price-old">S/ ${precioNormal}</span>
                    </div>
                    
                    <div class="hotel-promo-descuento">
                        <i class="fas fa-bolt"></i> Ahorras S/ ${precioNormal - precioPromo}
                    </div>
                    
                    <div class="hotel-promo-info">
                        Precio por noche en habitación simple
                    </div>
                </div>
                
                <div class="hotel-promo-actions">
                    ${whatsapp ? `
                    <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, vi la promoción AMIP 2026 de ' + hotel.nombre)}" 
                       class="hotel-promo-btn whatsapp" 
                       target="_blank" 
                       rel="noopener">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>` : ''}
                    
                    ${telefono ? `
                    <a href="tel:${telefono}" class="hotel-promo-btn telefono">
                        <i class="fas fa-phone"></i> Llamar
                    </a>` : ''}
                    
                    <a href="alojamientos.html?hotel=${nombreURL}" class="hotel-promo-btn ver-mas">
                        <i class="fas fa-info-circle"></i> Ver Más Detalles
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// INICIALIZACIÓN
// ========================================
// Cargar hoteles con promoción cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    cargarHotelesConPromocion();
});
