function Counter() {
	var COUNTERS = [];
	var TEXTS = [];
	var r = Raphael("counter", 45, 580),
		R = 6, 		// radius of circle 
		xi = 10, 	// x position
		sw = 5, 	// stroke-width
		total = 4, 	// number of stats
		marksAttr = { stroke: "lightgrey", fill: "none", "stroke-width": sw },
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" };
	
	addObj();

	r.customAttributes.arc = function (value, yi) {
		if (!yi) { return }
		var alpha = 360 * value / total,
			a = (90 - alpha) * Math.PI / 180,
			x = xi + R * Math.cos(a),
			y = yi - R * Math.sin(a),
			color = Raphael.hsb(0.7 - value * 0.17, 1, .8),
			path;
		// 0.6, 0.5, 0.3, 0.2, 0
		if (value == total) {
			path = [["M", xi, yi - R], ["A", R, R, 0, 1, 1, xi - 0.01, yi - R]];
		} else {
			path = [["M", xi, yi - R], ["A", R, R, 0, + (alpha > 180), 1, x, y]];			
		}
		return { path: path, stroke: color, opacity: .8, "stroke-width": sw };
	}

	function addObj(){
		for (var i = 1; i <= 8; i++) {
			var y = i * 75 - 50;
			r.circle(xi, y, R).attr(marksAttr);
			COUNTERS.push(r.path().attr({arc: [0, y]}));
			TEXTS.push(r.text(35, y, '00').attr(labelAttr));
		}
	}

	this.updateVal = function (i, v) {
		var value;
		if (v < 1) {
			value = 0;
		} else if (v < 42) {
			value = 1;
		} else if (v < 52) {
			value = 2;
		} else if (v < 62) {
			value = 3;
		} else {
			value = 4;
		}
		var id = 7 - i;
		var y = (id + 1) * 75 - 50;
		COUNTERS[id].animate({arc: [value, y]}, 900, ">");
		if (v < 10) {
			TEXTS[id].attr({text: '0' + v});
		} else {
			TEXTS[id].attr({text: v});
		}
		
	}
}