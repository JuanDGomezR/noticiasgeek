function showSection(section) {
  document.querySelectorAll(".news-section").forEach((sec) => {
    sec.style.display = "none";
  });
  document.getElementById(section).style.display = "block";
  // Resalta el botón activo
  document
    .querySelectorAll("nav button")
    .forEach((btn) => btn.classList.remove("active"));
  const btn = document.getElementById(`btn-${section}`);
  if (btn) btn.classList.add("active");
  // Vuelve a la página 1 al cambiar de sección
  if (currentPage[section] !== 1) {
    currentPage[section] = 1;
    currentQuery[section] = "";
  }
  refreshSection(section);
}

function showLoader(sectionId) {
  const section = document.getElementById(sectionId);
  section.innerHTML = `<div class="loader"></div>`;
}

const API_KEYS = {
  rawg: "3a3e9bbb100a49fa9731159a31d20e00",
  tmdb: "7f08b2b7ba1e82fe914ad8e200e48f14",
};

let currentPage = {
  videojuegos: 1,
  peliculas: 1,
};
let currentQuery = {
  videojuegos: "",
  peliculas: "",
};

// Elimino funciones y lógica de tecnología
// Mejoro renderVideojuegos y renderPeliculas para visualización más atractiva
function renderVideojuegos(games) {
  if (!games || games.length === 0) {
    return `<div class="no-results">No se encontraron videojuegos.</div>`;
  }
  return (
    `<div class="card-list">` +
    games
      .map(
        (game) => `
    <div class="card">
      <div class="card-img">
        ${
          game.background_image
            ? `<img src="${game.background_image}" alt="${game.name}">`
            : `<div class="img-placeholder">Sin imagen</div>`
        }
        <span class="card-badge">🎮 Videojuego</span>
      </div>
      <div class="card-content">
        <h3>${game.name}</h3>
        <div class="card-meta">
          <span><strong>Fecha:</strong> ${game.released || "Desconocida"}</span>
          <span><strong>Rating:</strong> ${game.rating || "N/A"}</span>
        </div>
        <a href="https://rawg.io/games/${
          game.slug
        }" target="_blank" class="card-link">Ver más detalles</a>
      </div>
    </div>
  `
      )
      .join("") +
    `</div>`
  );
}

function renderPeliculas(movies) {
  if (!movies || movies.length === 0) {
    return `<div class="no-results">No se encontraron películas.</div>`;
  }
  return (
    `<div class="card-list">` +
    movies
      .map((movie) => {
        let desc = movie.overview || "Sin descripción.";
        if (desc.length > 120) desc = desc.slice(0, 117) + "...";
        return `
    <div class="card">
      <div class="card-img">
        ${
          movie.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">`
            : `<div class="img-placeholder">Sin imagen</div>`
        }
        <span class="card-badge">🎬 Película</span>
      </div>
      <div class="card-content">
        <h3>${movie.title}</h3>
        <div class="card-meta">
          <span><strong>Fecha:</strong> ${
            movie.release_date || "Desconocida"
          }</span>
          <span><strong>Rating:</strong> ${movie.vote_average || "N/A"}</span>
        </div>
        <p class="card-desc">${desc}</p>
        <a href="https://www.themoviedb.org/movie/${
          movie.id
        }" target="_blank" class="card-link">Ver más detalles</a>
      </div>
    </div>
  `;
      })
      .join("") +
    `</div>`
  );
}

function mostrarMensajeActualizacion() {
  const div = document.getElementById("mensaje-actualizacion");
  const ahora = new Date();
  div.textContent = `Última actualización: ${ahora.toLocaleString()}`;
}

function fetchVideojuegos(page = 1, query = "") {
  showLoader("videojuegos");
  let url = `https://api.rawg.io/api/games?key=${API_KEYS.rawg}&page_size=5&page=${page}`;
  if (query) url += `&search=${encodeURIComponent(query)}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const section = document.getElementById("videojuegos");
      section.innerHTML = `
        <form class="search-form" onsubmit="event.preventDefault(); searchSection('videojuegos', this.q.value);">
          <input type="text" name="q" placeholder="Buscar videojuego..." value="${query}">
          <button type="submit">Buscar</button>
          <button type="button" onclick="resetSearch('videojuegos')" class="reset-btn">Reiniciar</button>
        </form>
        ${renderVideojuegos(data.results)}
        <div class="pagination">
          <button onclick="changePage('videojuegos', -1)" ${
            page <= 1 ? "disabled" : ""
          }>Anterior</button>
          <span>Página ${page}</span>
          <button onclick="changePage('videojuegos', 1)" ${
            !data.next ? "disabled" : ""
          }>Siguiente</button>
        </div>
      `;
    })
    .catch(() => {
      document.getElementById(
        "videojuegos"
      ).innerHTML = `<div class="error">Error al cargar videojuegos.</div>`;
    });
}

function fetchPeliculas(page = 1, query = "") {
  showLoader("peliculas");
  let url;
  if (query) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${
      API_KEYS.tmdb
    }&language=es-ES&page=${page}&query=${encodeURIComponent(query)}`;
  } else {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEYS.tmdb}&language=es-ES&page=${page}`;
  }
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const section = document.getElementById("peliculas");
      section.innerHTML = `
        <form class="search-form" onsubmit="event.preventDefault(); searchSection('peliculas', this.q.value);">
          <input type="text" name="q" placeholder="Buscar película..." value="${query}">
          <button type="submit">Buscar</button>
          <button type="button" onclick="resetSearch('peliculas')" class="reset-btn">Reiniciar</button>
        </form>
        ${renderPeliculas(data.results)}
        <div class="pagination">
          <button onclick="changePage('peliculas', -1)" ${
            page <= 1 ? "disabled" : ""
          }>Anterior</button>
          <span>Página ${page}</span>
          <button onclick="changePage('peliculas', 1)" ${
            page >= data.total_pages ? "disabled" : ""
          }>Siguiente</button>
        </div>
      `;
    })
    .catch(() => {
      document.getElementById(
        "peliculas"
      ).innerHTML = `<div class="error">Error al cargar películas.</div>`;
    });
}

// --- Navegación y búsqueda ---
function changePage(section, delta) {
  currentPage[section] += delta;
  if (currentPage[section] < 1) currentPage[section] = 1;
  refreshSection(section);
}

function searchSection(section, query) {
  currentQuery[section] = query;
  currentPage[section] = 1;
  refreshSection(section);
}

function refreshSection(section) {
  if (section === "videojuegos")
    fetchVideojuegos(currentPage.videojuegos, currentQuery.videojuegos);
  if (section === "peliculas")
    fetchPeliculas(currentPage.peliculas, currentQuery.peliculas);
}

function resetSearch(section) {
  currentQuery[section] = "";
  currentPage[section] = 1;
  refreshSection(section);
}

// Limpio inicialización y refresco
function refreshAll() {
  fetchVideojuegos(currentPage.videojuegos, currentQuery.videojuegos);
  fetchPeliculas(currentPage.peliculas, currentQuery.peliculas);
}
window.onload = () => {
  showSection("videojuegos");
  refreshAll();
  setInterval(refreshAll, 5 * 60 * 1000);
};
