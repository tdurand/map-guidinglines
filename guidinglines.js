import lineIntersect from '@turf/line-intersect';
import lineOffset from '@turf/line-offset';
import { lineString, featureCollection, point } from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
import distance from '@turf/distance';

export default class GuidingLines {

    // Interval in meters
    // Bbox : containing bbox of the grid
    // Reference line, strait [pointA, pointB] or curve [pointA, pointB, pointC, pointD]
    constructor(interval = 5, referenceLine, bbox) {
        this.interval = interval;
        this.bbox = bbox;
        this.referenceLine = referenceLine;
        this.lines = [];

        // Computed params
        this.bboxGeojson = bboxPolygon(bbox);
        this.referenceLineGeojson = lineString(referenceLine);
        // Bearing of reference line first and last point
        this.referenceLineBearing = bearing(point(this.referenceLine[0]), point(this.referenceLine[this.referenceLine.length - 1]));
        console.log(`Reference line bearing: ${this.referenceLineBearing}`);
        // Bbox diagonal length in meters
        this.bboxDiagonalLength = distance(point([bbox[0], bbox[1]]), point([bbox[2], bbox[3]]), {units: 'kilometers'}) * 1000;
        console.log(`bboxDiagonalLength in meters: ${this.bboxDiagonalLength}m`);
    }

    isLineInBbox(line) {
        // Check if Inside, and if it is not, if intersects
        if(booleanContains(this.bboxGeojson, line)) {
            return true;
        } else {
            if(lineIntersect(this.bboxGeojson, line).features.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    // Get line passing threw position and perpendicular to bearing
    computePerpendicularLine(position, bearing, halfLength) {
        let pointPosition = point(position);
        let pointA = destination(pointPosition, halfLength, bearing + 90, { units: "meters" });
        let pointB = destination(pointPosition, halfLength, bearing - 90, { units: "meters" });
        return lineString([pointA.geometry.coordinates, pointB.geometry.coordinates]);
    }

    generate() {
        // Get Bbox

        // Enlarge reference line to meet the bbox size
        // TODO, enlarge or cut referenceLine to meet the bbox
        
        // Create all parallels lines and store them
        var linesRight = []
        var linesLeft = []
        var previousLine = this.referenceLineGeojson;
        var lineOffsetted = lineOffset(previousLine, this.interval, { units: "meters" });

        // while inside BBOX 
        while (this.isLineInBbox(lineOffsetted)) {
            // Add to line list
            linesRight.push(lineOffsetted);
            // Create new parralel line
            previousLine = lineOffsetted;
            lineOffsetted = lineOffset(previousLine, this.interval, { units: "meters" });
            // TODO, enlarge or cut referenceLine to meet the bbox
        }

        console.log(`Created ${linesRight.length} to the right`);


        var lineOffsetted = lineOffset(this.referenceLineGeojson, -this.interval, { units: "meters" });

        // while inside BBOX 
        while (this.isLineInBbox(lineOffsetted)) {
            // Add to line list
            linesLeft.push(lineOffsetted);
            // create new parralel line
            previousLine = lineOffsetted;
            lineOffsetted = lineOffset(previousLine, -this.interval, { units: "meters" });
            // TODO, enlarge or cut referenceLine to meet the bbox
        }

        console.log(`Created ${linesLeft.length} to the left`);

        this.lines = this.lines.concat(linesLeft)
        this.lines = this.lines.concat(this.referenceLineGeojson);
        this.lines = this.lines.concat(linesRight);

        // For each assign an index in the property field (this will be used when using getClosestLine for styling)
        // lines.map((line, index) => {
        //   line.property.id = index;
        //})

        return featureCollection(this.lines);
    }

    // Change Guiding parameters
    update(bbox, interval) {
        this.bbox = bbox;
        this.interval = interval;
        this.generate();
        // NB: when changing interval / bbox size, the index will change for the lines, so user needs to call getClosestLineAgain
    }

    getClosestLine(position) {
        // Implement algorithm wrote on paper
        // --> Draw perpendicular line to bearing of reference line
        let perpendicularLine = this.computePerpendicularLine(position, this.referenceLineBearing, this.bboxDiagonalLength);
        // --> TODO optimize this with a binary search so we don't go threw all the lines
        let closestLine = {};
        let closestDistance = this.bboxDiagonalLength;
        let currentIntersection = null;
        let currentDistance =  this.bboxDiagonalLength;
        this.lines.map((line, index) => {
            currentIntersection = lineIntersect(perpendicularLine, line);
            if(currentIntersection.features.length > 0) {
                // Compute distance to position
                currentDistance = distance(currentIntersection.features[0], point(position), {units: 'kilometers'}) * 1000;
                // New closest line
                if(currentDistance < closestDistance) {
                    closestLine = {
                        index: index,
                        distance: currentDistance,
                        line: line
                    }
                    closestDistance = currentDistance;
                }
            }
        })

        return closestLine;
    }

    // Get guiding lines in geojson to display on a map
    getGeojson() {
        // TODO
        //turf.featureCollection(this.lines)
    }
}

