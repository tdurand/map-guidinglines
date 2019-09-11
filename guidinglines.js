

export default class GuidingLines {

    // Interval in meters
    // Bbox : containing bbox of the grid
    // Reference line, strait [pointA, pointB] or curve [pointA, pointB, pointC, pointD]
    constructor(interval = 5, referenceLine, bbox) {
        this.interval = interval;
        this.bbox = bbox;
        this.referenceLine = referenceLine; // TODO see if this could be a 
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


    }

    // Change Guiding parameters
    update(bbox, interval) {
        this.bbox = bbox;
        this.interval = interval;
        this.generate();
    }

    getClosestLine(position) {
        // Implement algorithm

        // return line ID
    }

    // Get guiding lines in geojson to display on a map
    getGeojson() {
        // TODO
    }
}