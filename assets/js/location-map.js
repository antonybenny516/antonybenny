/*
 * Reusable interactive location map.
 * Each page declares a container: <div data-location-map='{...json config...}'></div>
 * Leaflet + boundary GeoJSON are only fetched when the container scrolls near the viewport.
 */
(function () {
    var LEAFLET_CSS = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
    var LEAFLET_JS = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    var leafletPromise = null;

    function loadLeaflet() {
        if (window.L) return Promise.resolve();
        if (leafletPromise) return leafletPromise;

        leafletPromise = new Promise(function (resolve, reject) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS;
            document.head.appendChild(link);

            var script = document.createElement('script');
            script.src = LEAFLET_JS;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
        return leafletPromise;
    }

    function renderMap(container, config) {
        loadLeaflet().then(function () {
            var map = L.map(container, {
                zoomControl: false,
                attributionControl: false,
                scrollWheelZoom: true,
                minZoom: 6,
                maxZoom: 14
            }).setView(config.fallbackCenter, config.fallbackZoom);

            L.control.zoom({ position: 'bottomright' }).addTo(map);
            L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

            // Esri World Street Map: free, no API key required, bright/readable style.
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                maxZoom: 18
            }).addTo(map);

            var loading = container.querySelector('.map-loading');

            var defaultBoundaryStyle = {
                color: '#2563eb',
                weight: 3,
                fillColor: '#3b82f6',
                fillOpacity: 0.06
            };
            var boundaryStyle = Object.assign({}, defaultBoundaryStyle, config.boundaryStyle || {});

            fetch(config.boundaryUrl)
                .then(function (res) { return res.json(); })
                .then(function (geojson) {
                    var boundaryLayer = L.geoJSON(geojson, {
                        style: boundaryStyle
                    }).addTo(map);

                    map.fitBounds(boundaryLayer.getBounds(), { padding: [24, 24] });

                    if (config.highlight) {
                        L.circleMarker(config.highlight.coords, {
                            radius: 9,
                            color: '#ffffff',
                            weight: 2,
                            fillColor: '#dc2626',
                            fillOpacity: 1
                        })
                            .addTo(map)
                            .bindPopup(config.highlight.label);
                    }
                })
                .finally(function () {
                    if (loading) loading.remove();
                });
        });
    }

    function init() {
        var containers = document.querySelectorAll('[data-location-map]');
        if (!containers.length) return;

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                obs.unobserve(el);

                var config;
                try {
                    config = JSON.parse(el.getAttribute('data-location-map'));
                } catch (e) {
                    return;
                }
                renderMap(el, config);
            });
        }, { rootMargin: '200px' });

        containers.forEach(function (el) { observer.observe(el); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
