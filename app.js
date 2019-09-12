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
    var guidingLinesGeojson = guidingLines.generate();

    
    map.addSource("helper", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [
                bboxGeojson
                , {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-121.42,40.51]
                    }
                }
            ]
        }
    });

    //console.log(guidingLinesGeojson);

    map.addSource("guiding-lines", {
        "type": "geojson",
        "data": guidingLinesGeojson
    })

    map.addLayer({
        "id": "bbox-boundary",
        "type": "fill",
        "source": "helper",
        "paint": {
            "fill-color": "#888888",
            "fill-opacity": 0.1
        }
    });

    map.addLayer({
        "id": "position",
        "type": "circle",
        "source": "helper",
        "paint": {
            "circle-radius": 6,
            "circle-color": "#B42222"
        },
        "filter": ["==", "$type", "Point"],
    });



    // TODO Need to use https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
    // To style current line differently

    map.addLayer({
        "id": "guidinglines",
        "type": "line",
        "source": "guiding-lines",
        "paint": {
            "line-color": "red",
            "line-width": 2
        },
        "filter": ["==", "$type", "LineString"],
    });

    window.guidingLines = guidingLines;
    window.map = map;
});


