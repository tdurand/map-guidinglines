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

    var referenceLine = [[-121.418961, 40.506229], [-121.412, 40.51]];

    var guidingLines = new GuidingLines(100, referenceLine, bbox);

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
                        "coordinates": referenceLine
                    }
                }, { 
                    "type": "Feature", 
                    "properties": {}, 
                    "geometry": { 
                        "type": "LineString", 
                        "coordinates": [[-121.41253542917906,40.494367849513544],[-121.40557442917907,40.498138849513545]] 
                    } 
                }
            ]
        }
    });

    map.addLayer({
        "id": "bbox-boundary",
        "type": "fill",
        "source": "national-park",
        "paint": {
            "fill-color": "#888888",
            "fill-opacity": 0.1
        },
        "filter": ["==", "$type", "Polygon"]
    });

    // TODO Need to use https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
    // To style current line differently

    map.addLayer({
        "id": "guidinglines",
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


