function applySavedTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");
  const themeToggleText = document.getElementById("theme-toggle-text");
  if (!themeToggle) return;

  function applyTheme(theme) {
    const isDarkMode = theme === "dark";
    document.body.classList.toggle("dark-mode", isDarkMode);
    themeToggleIcon.textContent = isDarkMode ? "☀️" : "🌙";
    themeToggleText.textContent = isDarkMode ? "라이트 모드" : "다크 모드";
    themeToggle.setAttribute("aria-label", `${themeToggleText.textContent}로 전환`);
    localStorage.setItem("theme", theme);
  }

  const savedTheme = localStorage.getItem("theme");
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDarkMode ? "dark" : "light"));

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function initLiteraryMap(config) {
  const mapEl = document.getElementById(config.mapId);
  const panelEl = document.getElementById(config.panelId);
  if (!mapEl || !panelEl || !window.L) return;

  const map = L.map(mapEl, { scrollWheelZoom: true }).setView(config.center, config.zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const markerIcon = L.divIcon({
    className: "literary-marker",
    html: `<span class="literary-marker-pin" aria-hidden="true">
      <svg viewBox="0 0 32 42" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
        <path class="literary-marker-shape" fill="${config.markerColor}" d="M16 1C9.1 1 4 6.45 4 13.2c0 9.8 12 27.8 12 27.8s12-18 12-27.8C28 6.45 22.9 1 16 1z"/>
        <ellipse cx="16" cy="13" rx="5.5" ry="6" fill="#fff" opacity="0.95"/>
      </svg>
    </span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });

  let activeMarker = null;

  function formatCityName(city, { html = false } = {}) {
    if (html) {
      return `${city.nameKo} <span class="city-name-local">${city.nameLocal}</span>`;
    }
    return `${city.nameKo} · ${city.nameLocal}`;
  }

  function renderPanel(city) {
    panelEl.innerHTML = `
      <div class="city-panel-content">
        <span class="city-panel-label">${city.id}</span>
        <h2>${formatCityName(city, { html: true })}</h2>
        <div class="city-panel-meta">
          <div class="city-panel-field">
            <span class="city-panel-field-label">작품</span>
            <p class="city-panel-work">『${city.work}』</p>
          </div>
          <div class="city-panel-field">
            <span class="city-panel-field-label">작가</span>
            <p>${city.author}</p>
          </div>
          <div class="city-panel-field">
            <span class="city-panel-field-label">도시 소개</span>
            <p>${city.cityIntro}</p>
          </div>
          <div class="city-panel-field">
            <span class="city-panel-field-label">작품 소개</span>
            <p>${city.workIntro}</p>
          </div>
        </div>
      </div>
    `;
  }

  function showPlaceholder() {
    panelEl.innerHTML = `
      <div class="city-panel-placeholder">
        <p class="city-panel-hint">지도 위 마커를 클릭하면<br>도시와 연계된 문학 작품 정보를 볼 수 있습니다.</p>
        <ul class="city-panel-list">
          ${config.cities.map((city) => `<li><button type="button" data-city-id="${city.id}">${formatCityName(city, { html: true })}</button></li>`).join("")}
        </ul>
      </div>
    `;

    panelEl.querySelectorAll("[data-city-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const city = config.cities.find((item) => item.id === button.dataset.cityId);
        if (city) selectCity(city);
      });
    });
  }

  function selectCity(city) {
    if (activeMarker) {
      activeMarker.getElement()?.classList.remove("is-active");
    }

    const marker = city.marker;
    marker.getElement()?.classList.add("is-active");
    activeMarker = marker;
    map.panTo([city.lat, city.lng], { animate: true });
    renderPanel(city);
  }

  config.cities.forEach((city) => {
    const marker = L.marker([city.lat, city.lng], { icon: markerIcon }).addTo(map);
    marker.bindTooltip(`${formatCityName(city)}<br><small>${city.work}</small>`, {
      direction: "top",
      offset: [0, -18],
    });
    marker.on("click", () => selectCity(city));
    city.marker = marker;
  });

  showPlaceholder();
  setTimeout(() => map.invalidateSize(), 120);
}

applySavedTheme();
