function Counter() {
	var COUNTERS = [];
	var TEXTS = [];
	var r = Raphael("counter", 45, 580),
		R = 6, // radius of circle 
		xi = 10, // x position
		total = 6, // number of stats
		marksAttr = { stroke: "lightgrey", fill: "none", "stroke-width": 4 },
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" };
	
	addObj();

	r.customAttributes.arc = function (value, yi) {
		if (!yi) { return }
		var alpha = 360 * value / total,
			a = (90 - alpha) * Math.PI / 180,
			x = xi + R * Math.cos(a),
			y = yi - R * Math.sin(a),
			color = Raphael.hsb( (total - value) / total, 1, .75),
			path;
		if (value == total) {
			path = [["M", xi, yi - R], ["A", R, R, 0, 1, 1, xi - 0.01, yi - R]];
		} else {
			path = [["M", xi, yi - R], ["A", R, R, 0, + (alpha > 180), 1, x, y]];			
		}
		return { path: path, stroke: color, opacity: .8, "stroke-width": 4 };
	}

	function addObj(){
		var xl = 35;
		var m = 0;

		// r.text(xl, 25 - m,  '4F').attr(labelAttr);
		// r.text(xl, 100 - m, '4S').attr(labelAttr);
		// r.text(xl, 175 - m, '3F').attr(labelAttr);
		// r.text(xl, 250 - m, '3S').attr(labelAttr);
		// r.text(xl, 325 - m, '2F').attr(labelAttr);
		// r.text(xl, 400 - m, '2S').attr(labelAttr);
		// r.text(xl, 475 - m, '1F').attr(labelAttr);
		// r.text(xl, 550 - m, '1S').attr(labelAttr);

		for (var i = 1; i <= 8; i++) {
			var y = i * 75 - 50;
			r.circle(xi, y, R).attr(marksAttr);
			COUNTERS.push(r.path().attr({arc: [0, y]}));
			TEXTS.push(r.text(xl, y + m, '00').attr(labelAttr));
		}
	}

	this.updateVal = function (i, v) {
		var value;
		if (v < 1) {
			value = 0;
		} else if (v < 11) {
			value = 1;
		} else if (v < 21) {
			value = 2;
		} else if (v < 42) {
			value = 3;
		} else if (v < 52) {
			value = 4;
		} else if (v < 62) {
			value = 5;
		} else {
			value = 6;
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