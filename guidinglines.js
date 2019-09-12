import lineIntersect from '@turf/line-intersect';
import lineOffset from '@turf/line-offset';
import { lineString, featureCollection } from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';

export default class GuidingLines {

    // Interval in meters
    // Bbox : containing bbox of the grid
    // Reference line, strait [pointA, pointB] or curve [pointA, pointB, pointC, pointD]
    constructor(interval = 5, referenceLine, bbox) {
        this.interval = interval;
        this.bbox = bbox;
        this.bboxGeojson = bboxPolygon(bbox);
        this.referenceLine = referenceLine; // TODO see if this could be a 
        this.referenceLineGeojson = lineString(referenceLine);
        // this.referenceLineBearing = bearing(firstPoint, lastPoint);
        this.lines = [];
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
            // create new parralel line
            console.log('create parralal line');
            previousLine = lineOffsetted;
            lineOffsetted = lineOffset(previousLine, this.interval, { units: "meters" });
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
        // --> run a binary search on this.lines to get the closest turf.intersectLine() : https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
        // return line ID + distance to line
    }

    // Get guiding lines in geojson to display on a map
    getGeojson() {
        // TODO
        //turf.featureCollection(this.lines)
    }
}

