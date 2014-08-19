function Counter() {
	var COUNTERS = [];
	var TEXTS = [];
	var r = Raphael("counter", 45, 580),
		R = 15, 	// radius of circle 
		xi = 20, 	// x position
		sw = 10, 	// stroke-width
		total = 5, 	// number of stats
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" };
	addObj();

	r.customAttributes.arc = function (value, yi) {
		if (!yi) { return }
		var alpha = 180 * value / total,
			a = (90 - alpha) * Math.PI / 180,
			x = xi + R * Math.cos(a),
			y = yi - R * Math.sin(a),
			color = Raphael.hsb(0.7 - value * 0.13, 1, .8),
			path;
		path = [["M", xi, yi - R], ["A", R, R, 0, + (alpha > 180), 1, x, y]];
		return { path: path, stroke: color, opacity: .8, "stroke-width": sw };
	}

	function addObj(){
		var path;
		for (var i = 1; i <= 8; i++) {
			var y = i * 75 - 50;
			var a = (-90) * Math.PI / 180;
			path = [["M", xi, y - R], ["A", R, R, 0, 0, 1, xi + R * Math.cos(a), y - R * Math.sin(a)]];
			r.path().attr({path: path, stroke: "#ECECEC", fill: "none", "stroke-width": sw });
			COUNTERS.push(r.path());
			TEXTS.push(r.text(15, y, 0).attr(labelAttr));
		}
	}

	this.updateVal = function (i, v) {
		var value;
		if (v < 1) {
			value = 0;
		} else if (v < 36) {
			value = 1;
		} else if (v < 46) {
			value = 2;
		} else if (v < 52) {
			value = 3;
		} else if (v < 64) {
			value = 4;
		} else {
			value = 5;
		}
		var id = 7 - i;
		var y = (id + 1) * 75 - 50;
		COUNTERS[id].animate({arc: [value, y]}, 1000);
		TEXTS[id].attr({text: v});
	}
}