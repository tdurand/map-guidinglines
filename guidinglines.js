

export default class GuidingLines {

    // Interval in meters
    // Bbox : containing bbox of the grid
    // Reference line, strait [pointA, pointB] or curve [pointA, pointB, pointC, pointD]
    constructor(interval = 5, referenceLine, bbox) {
        this.interval = interval;
        this.bbox = bbox;
        this.referenceLine = referenceLine; // TODO see if this could be a 
        // this.referenceLineBearing = bearing(firstPoint, lastPoint);
        this.lines = [];
    }

    generate() {
        // Get Bbox

        // Enlarge reference line to meet the bbox size
        // TODO, enlarge or cut referenceLine to meet the bbox
        
        // Create all parallels lines and store them
        // var linesRight = []
        // while inside BBOX 
        //  var line = turf.lineOffset(line, interval, { units: "m" })
        //  TODO, enlarge or cut line to meet the bbox
        //  linesRight.add(line)

        // var linesLeft = []
        // while inside BBOX (on the other side)
        //  var line = turf.lineOffset(line, -interval, { unites: "m"})
        //  TODO, enlarge or cut line to meet the bbox
        //  linesLeft.add(line)

        //lines.push(linesLeft)
        //lines.push(linesRight)
        

        // For each assign an index in the property field (this will be used when using getClosestLine for styling)
        // lines.map((line, index) => {
        //   line.property.id = index;
        //})
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

