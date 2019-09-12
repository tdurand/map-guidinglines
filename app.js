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
    var position = [-121.42,40.515];

    var guidingLines = new GuidingLines(50, referenceLine, bbox);
    var guidingLinesGeojson = guidingLines.generate();
    var perpendicularLine = guidingLines.computePerpendicularLine(position, guidingLines.referenceLineBearing, guidingLines.bboxDiagonalLength);

    var closestLine = guidingLines.getClosestLine(position);

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
                        "coordinates": position
                    }
                },
                perpendicularLine,
                closestLine.line
            ]
        }
    });

    //console.log(guidingLinesGeojson);

    map.addSource("guiding-lines", {
        "type": "geojson",
        "data": guidingLinesGeojson
    })

    map.addLayer({
        "id": "guidinglines",
        "type": "line",
        "source": "guiding-lines",
        "paint": {
            "line-color": "green",
            "line-width": 2
        },
        "filter": ["==", "$type", "LineString"],
    });

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

    map.addLayer({
        "id": "perpendicularline",
        "type": "line",
        "source": "helper",
        "paint": {
            "line-color": "blue",
            "line-width": 2
        },
        "filter": ["==", "$type", "LineString"],
    });

    map.on('moveend', () => {
        console.log('moveend');
        var newBbox = map.getBounds().toArray().flat();
        var needResizing = !guidingLines.isBiggerThan(newBbox);
        // If bounds are bigger than the bbox, need to resize the guiding lines
        if(needResizing) {
            guidingLines.updateBbox(newBbox);

            var guidingLinesGeojson = guidingLines.generate();
            var perpendicularLine = guidingLines.computePerpendicularLine(position, guidingLines.referenceLineBearing, guidingLines.bboxDiagonalLength);
            var closestLine = guidingLines.getClosestLine(position);
            map.getSource('guiding-lines').setData(guidingLinesGeojson);
            map.getSource('helper').setData({
                "type": "FeatureCollection",
                "features": [
                    bboxGeojson
                    , {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": position
                        }
                    },
                    perpendicularLine,
                    closestLine.line
                ]
            });
        }
    })

    // TODO Need to use https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
    // To style current line differently

    window.guidingLines = guidingLines;
    window.map = map;
});


