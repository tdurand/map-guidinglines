import GuidingLines from './guidinglines';
import bboxPolygon from '@turf/bbox-polygon';
import { mapboxToken } from './config';
mapboxgl.accessToken = mapboxToken;

var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/outdoors-v11",
    center: [-121.415061, 40.506229],
    zoom: 15
});

map.on("load", function () {

    // Get bbox from bounds
    var bbox = map.getBounds().toArray().flat()

    var bboxGeojson = bboxPolygon(bbox);

    var guidingLines = new GuidingLines(10, [[-121.415061, 40.506229], [-121.41, 40.52]], bbox);

    map.addSource("national-park", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [
                bboxGeojson
            , {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[-121.418961, 40.506229], [-121.412, 40.51]]
                }
            }]
        }
    });

    map.addLayer({
        "id": "park-boundary",
        "type": "fill",
        "source": "national-park",
        "paint": {
            "fill-color": "#888888",
            "fill-opacity": 0.1
        },
        "filter": ["==", "$type", "Polygon"]
    });

    map.addLayer({
        "id": "park-volcanoes",
        "type": "line",
        "source": "national-park",
        "paint": {
            "line-color": "red",
            "line-width": 2
        },
        "filter": ["==", "$type", "LineString"],
    });

    window.guidingLines = guidingLines;
    window.map = map;
});


