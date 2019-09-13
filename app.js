import GuidingLines from './guidinglines';
import bboxPolygon from '@turf/bbox-polygon';


var position = [-121.415061, 40.506229];

var map = new mapboxgl.Map({
    container: "map",
    style: {
        "version": 8,
        "sources": {
            "simple-tiles": {
                "type": "raster",
                // point to our third-party tiles. Note that some examples
                // show a "url" property. This only applies to tilesets with
                // corresponding TileJSON (such as mapbox tiles). 
                "tiles": [
                    "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
                ],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "simple-tiles",
            "type": "raster",
            "source": "simple-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    },
    center: position,
    zoom: 17
});

map.on("load", function () {

    // Get bbox from bounds
    var bbox = map.getBounds().toArray().flat()

    var bboxGeojson = bboxPolygon(bbox);

    var referenceLine = [[-121.418961, 40.506229], [-121.412, 40.51]];
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
                //perpendicularLine,
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
            console.log('Update bbox')
            var updated = guidingLines.updateBbox(newBbox);

            if(updated) {
                console.log('Generate guidinglines')
                var guidingLinesGeojson = guidingLines.generate();
                map.getSource('guiding-lines').setData(guidingLinesGeojson);
            }
        }

        console.log('Compute closest line')
        position = map.getCenter().toArray();
        var closestLine = guidingLines.getClosestLine(position);
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
                //closestLine.perpendicularLine,
                closestLine.line
            ]
        });
    })

    // TODO Need to use https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
    // To style current line differently

    window.guidingLines = guidingLines;
    window.map = map;
});


