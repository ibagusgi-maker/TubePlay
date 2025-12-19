// Variables globales
let moviesData = {};
let currentCategory = 'estrenos';

// Cargar datos de películas al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await loadMoviesData();
    showCategory('estrenos', document.querySelector('.nav-link.active'));
});

// Función para cargar datos desde movies.json
async function loadMoviesData() {
    try {
        const response = await fetch('movies-v2.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar movies.json');
        }
        moviesData = await response.json();
        console.log('Películas cargadas:', moviesData);
    } catch (error) {
        console.error('Error cargando películas:', error);
        document.getElementById('categoriesContainer').innerHTML = 
            '<div class="error">❌ Error cargando películas. Verifica que movies-v2.json existe.</div>';
    }
}

// Función para mostrar categoría
function showCategory(categoryId, linkElement) {
    currentCategory = categoryId;
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (linkElement) {
        linkElement.classList.add('active');
    }
    
    // Generar HTML de la categoría
    generateCategoryHTML(categoryId);
    
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para generar HTML de una categoría
function generateCategoryHTML(categoryId) {
    const container = document.getElementById('categoriesContainer');
    const movies = moviesData[categoryId] || [];
    
    if (movies.length === 0) {
        container.innerHTML = `
            <div class="category-section">
                <div class="category-title">${getCategoryIcon(categoryId)} ${getCategoryName(categoryId)}</div>
                <div class="error">No hay películas en esta categoría aún.</div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="category-section">
            <div class="category-title">${getCategoryIcon(categoryId)} ${getCategoryName(categoryId)}</div>
    `;
    
    // Mostrar primeras películas
    const initialMovies = movies.slice(0, 6);
    const moreMovies = movies.slice(6);
    
    initialMovies.forEach(movie => {
        html += generateMovieItemHTML(movie);
    });
    
    // Sección "Ver más" si hay más películas
    if (moreMovies.length > 0) {
        html += `
            <div id="${categoryId}-more" class="hidden-section">
        `;
        
        moreMovies.forEach(movie => {
            html += generateMovieItemHTML(movie);
        });
        
        html += `
            </div>
            <div class="load-more-section">
                <button class="load-more-btn" onclick="loadMore('${categoryId}')">
                    Ver más ${getCategoryName(categoryId).toLowerCase()} ↓
                </button>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Función para generar HTML de un item de película
function generateMovieItemHTML(movie) {
    const displayTitle = movie.year ? `${movie.title} (${movie.year})` : movie.title;
    const subtitle = createSubtitle(movie);
    
    // Escapar datos para JavaScript
    const movieDataStr = JSON.stringify({
        year: movie.year || '',
        genre: movie.genres || movie.genre || '',
        rating: movie.rating || 0,
        description: movie.description || ''
    }).replace(/"/g, '&quot;');
    
    let thumbHTML;
    if (movie.thumbUrl && movie.thumbUrl.trim() !== '') {
        thumbHTML = `
            <img class="movie-thumb" src="${movie.thumbUrl}" alt="${movie.title}" 
                 onload="this.style.display='block'" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div class="movie-thumb" style="display: none; background: linear-gradient(135deg, #333, #555); align-items: center; justify-content: center; color: #fff; font-size: 2rem;">▶</div>
        `;
    } else {
        thumbHTML = `
            <div class="movie-thumb" style="background: linear-gradient(135deg, #333, #555); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2rem;">▶</div>
        `;
    }
    
    return `
        <div class="movie-item" onclick="playMovie('${movie.embedUrl}', '${displayTitle.replace(/'/g, "\\'")}', this, JSON.parse('${movieDataStr}'))" title="${movie.description || ''}">
            ${thumbHTML}
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <p>${subtitle}</p>
            </div>
        </div>
    `;
}

// Función para crear subtitle con información
function createSubtitle(movie) {
    let parts = [];
    
    if (movie.year) parts.push(movie.year);
    if (movie.genres || movie.genre) parts.push(movie.genres || movie.genre);
    if (movie.rating && movie.rating > 0) parts.push(`⭐ ${movie.rating.toFixed(1)}`);
    
    return parts.join(' • ') || 'Película';
}

// Función para reproducir película
function playMovie(url, title, element, movieData = {}) {
    // Actualizar reproductor
    document.getElementById('mainPlayer').src = url;
    document.getElementById('movieTitle').textContent = title;
    
    // Actualizar metadatos
    const metaElement = document.getElementById('movieMeta');
    const descElement = document.getElementById('movieDescription');
    
    let metaHTML = '';
    if (movieData.year) {
        metaHTML += `<span>📅 ${movieData.year}</span>`;
    }
    if (movieData.genre) {
        metaHTML += `<span>🎭 ${movieData.genre}</span>`;
    }
    if (movieData.rating && movieData.rating > 0) {
        metaHTML += `<span class="movie-rating">⭐ ${movieData.rating.toFixed(1)}</span>`;
    }
    
    if (metaHTML) {
        metaElement.innerHTML = metaHTML;
        metaElement.style.display = 'flex';
    } else {
        metaElement.style.display = 'none';
    }
    
    // Actualizar descripción
    if (movieData.description && movieData.description.trim() !== '') {
        descElement.textContent = movieData.description;
        descElement.style.display = 'block';
    } else {
        descElement.style.display = 'none';
    }
    
    // Actualizar estado activo
    document.querySelectorAll('.movie-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
}

// Función para cargar más contenido
function loadMore(categoryId) {
    const moreSection = document.getElementById(categoryId + '-more');
    const button = event.target;
    
    if (moreSection.classList.contains('show')) {
        // Ocultar contenido
        moreSection.classList.remove('show');
        button.textContent = button.textContent.replace('menos', 'más').replace('↑', '↓');
    } else {
        // Mostrar contenido
        moreSection.classList.add('show');
        button.textContent = button.textContent.replace('más', 'menos').replace('↓', '↑');
        
        // Scroll suave hacia el contenido nuevo
        setTimeout(() => {
            moreSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

// Funciones auxiliares
function getCategoryIcon(categoryId) {
    const icons = {
        'estrenos': '🆕',
        'accion': '🔥',
        'drama': '🎭',
        'infantil': '👶',
        'ficcion': '🚀',
        'terror': '👻'
    };
    return icons[categoryId] || '🎬';
}

function getCategoryName(categoryId) {
    const names = {
        'estrenos': 'Estrenos',
        'accion': 'Acción',
        'drama': 'Drama',
        'infantil': 'Infantil',
        'ficcion': 'Ficción',
        'terror': 'Terror'
    };
    return names[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}

// Navegación por teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Cerrar secciones expandidas
        document.querySelectorAll('.hidden-section.show').forEach(section => {
            section.classList.remove('show');
        });
    }
});