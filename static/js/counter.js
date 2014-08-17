function Counter() {
	var COUNTERS = [];
	var r = Raphael("counter", 45, 580),
		R = 5, // radius of circle 
		xi = 35, // x position
		total = 6, // number of stats
		marksAttr = { stroke: "lightgrey", fill: "none", "stroke-width": 10 },
		labelAttr = { stroke: "none", fill: "#555", "font-size": "10px" };
	
	addObj();

	r.customAttributes.arc = function (value, yi) {
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
		var xt = 10;
		r.text(xt, 25,  'SE2').attr(labelAttr);
		r.text(xt, 100, 'SE1').attr(labelAttr);
		r.text(xt, 175, 'JU2').attr(labelAttr);
		r.text(xt, 250, 'JU1').attr(labelAttr);
		r.text(xt, 325 , 'SO2').attr(labelAttr);
		r.text(xt, 400, 'SO1').attr(labelAttr);
		r.text(xt, 475, 'FR2').attr(labelAttr);
		r.text(xt, 550, 'FR1').attr(labelAttr);
		for (var i = 1; i <= 8; i++) {
			var y = i * 75 - 50;
			r.circle(xi, y, 2).attr(marksAttr);
			COUNTERS.push(r.path().attr({arc: [0, y]}));
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
	}
}