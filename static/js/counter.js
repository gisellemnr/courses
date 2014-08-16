var COUNTERS = [];
var MARKS = [];

$(document).ready(function() {
	var r = Raphael("counter", 40, 580),
		R = 5, // radius of circle 
		xi = 30, // x position
		total = 6, // number of stats
		param = { stroke: "#fff", "stroke-width": 30 },
		marksAttr = { fill: "lightgrey", stroke: "none" },
		labelAttr = {
			stroke: "none",
			fill: "#555",
			'font-size': '10px'
		};

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

	function drawMarks(yi) {
		var out = r.set();
		for (var value = 0; value < (total * 2); value++) {
			var alpha = 360 / (total * 2) * value,
				a = (90 - alpha) * Math.PI / 180,
				x = xi + R * Math.cos(a),
				y = yi - R * Math.sin(a);
			out.push(r.circle(x, y, 1).attr(marksAttr));
		}
		return out;
	}

	function addCounter(y){
		drawMarks(y)
		COUNTERS.push(r.path().attr(param).attr({arc: [0, y]}));
	}

	function updateVal(id, value) {
		var y = (id + 1) * 75 - 50;
		COUNTERS[id].animate({arc: [value, y]}, 900, ">");
	}

	for (var i = 1; i <= 8; i++) {
		addCounter(i * 75 - 50);
	}

	r.text(10, 25,  'SE2').attr(labelAttr);
	r.text(10, 100, 'SE1').attr(labelAttr);
	r.text(10, 175, 'JU2').attr(labelAttr);
	r.text(10, 250, 'JU1').attr(labelAttr);
	r.text(10, 325 , 'SO2').attr(labelAttr);
	r.text(10, 400, 'SO1').attr(labelAttr);
	r.text(10, 475, 'FR2').attr(labelAttr);
	r.text(10, 550, 'FR1').attr(labelAttr);

	updateVal(0, 0);
	updateVal(1, 1);
	updateVal(2, 2);
	updateVal(3, 3);
	updateVal(4, 4);
	updateVal(5, 5);
	updateVal(6, 6);
	updateVal(7, 6);
});