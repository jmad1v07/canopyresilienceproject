
// Tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})


// Map Points
// Adapted from: https://maplibre.org/maplibre-gl-js/docs/examples/cluster/
const legend = document.getElementById('legend');
const labels = ['0%', '', '', '100%']; // Customize labels

for (let i = 0; i < labels.length; i++) {
    const label = document.createElement('div');
    label.classList.add('legendLabel');
    label.textContent = labels[i];
    legend.appendChild(label);
}

const mapPoints = new maplibregl.Map({
    container: 'mapPoints',
    style: {
        'id': 'raster',
        'version': 8,
        'name': 'Raster tiles',
        'center': [0, 0],
        'zoom': 0,
        'sources': {
            'raster-tiles': {
                'type': 'raster',
                'tiles': ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
                'tileSize': 256,
                'minzoom': 0,
                'maxzoom': 16,
                'attribution': 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            }
        },
        'layers': [
            {
                'id': 'background',
                'type': 'background',
                'paint': {
                    'background-color': '#e0dfdf'
                }
            },
            {
                'id': 'simple-tiles',
                'type': 'raster',
                'source': 'raster-tiles'
            }
        ]
    },
    center: [115.81609649894, -31.97812224129371],
    zoom: 7
});

mapPoints.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    mapPoints.addSource('trees', {
        type: 'geojson',
        data: 'https://storage.googleapis.com/tree_death_spatial_layers/tree_death_points.geojson',
        cluster: true,
        clusterMaxZoom: 10, // Max zoom to cluster points on
        clusterRadius: 22 // Radius of each cluster when clustering points (defaults to 50)
    });

    mapPoints.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'trees',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://maplibre.org/maplibre-style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            'circle-color': '#31a354',
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                12, 
                5,
                18, 
                15,
                22
            ]
        }
    });

    mapPoints.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'trees',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'live'],
                0, '#de77ae', 
                25, '#fde0ef',
                50, '#e6f5d0',
                75, '#b8e186',
                100, '#4d9221',  
            ],
            'circle-radius': 8,
            // 'circle-stroke-width': 0.1,
            // 'circle-stroke-color': '#00441b'
        }
    });

    // inspect a cluster on click
    mapPoints.on('click', 'clusters', async (e) => {
        const features = mapPoints.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await mapPoints.getSource('trees').getClusterExpansionZoom(clusterId);
        mapPoints.easeTo({
            center: features[0].geometry.coordinates,
            zoom
        });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    mapPoints.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const live = e.features[0].properties.live;
        const dead = e.features[0].properties.dead;
        const bare = e.features[0].properties.bare;

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `live: ${live}%<br>bare: ${bare}%<br>dead: ${dead}%`
            )
            .addTo(mapPoints);
    });

    mapPoints.on('mouseenter', 'clusters', () => {
        mapPoints.getCanvas().style.cursor = 'pointer';
    });
    mapPoints.on('mouseleave', 'clusters', () => {
        mapPoints.getCanvas().style.cursor = '';
    });
});