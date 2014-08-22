function Counter() {
	var NEEDLES = [];
	var TEXTS = [];
	var r = Raphael("counter", 45, 580),
		leg = Raphael("counter-legend", 250, 250),
		R = 15, 	// radius of circle 
		xi = 20, 	// x position
		sw = 12, 	// stroke-width
		parts = 5, 	// number of stats
		colors = [0, .15, .35, .15, 0]
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" };
	addObj();

	function addObj(){
		for (var i = 1; i <= 8; i++) {
			var yi = i * 75 - 50;
			var p = parts * 12,
				alpha = 180 / p,
				a = (90 - alpha) * Math.PI / 180,
				x = xi + R * Math.cos(a),
				y = yi - R * Math.sin(a),
				path = [["M", xi, yi - R], ["A", R, R, 0, + (alpha > 180), 1, x, y]];
	        for (var j = 0; j < p; j++) {
	        	var hex = 0.5 - j/p * 0.5;
	        	if (j < p/2) {
	        		hex = 0.5 - (p-j)/p * 0.5;
	        	}
	            r.path(path).attr({
	                stroke: Raphael.hsb(hex, 1, 0.85),
	                transform: "r" + [alpha * j, xi, yi],
	                "stroke-width": sw,
	                cursor: "pointer"
	            });
	        }
			TEXTS.push(r.text(15, yi, 0).attr(labelAttr));
			var needle = r.path(["M", xi, yi - 5, "L", xi + 4, yi - 10, "L", xi, yi - 20, "L", xi - 4, yi - 10]).attr({
                fill: "#333",
                stroke: "none"
            });
            NEEDLES.push(needle);
		}
		var yi = 150,
			p = parts * 12 * 2,
			alpha = 180 / p,
			a = (90 - alpha) * Math.PI / 180,
			x = xi + 100 + R * 4 * Math.cos(a),
			y = yi - R * 4 * Math.sin(a);
		for (var j = 0; j < p; j++) {
        	var hex = 0.5 - j/p * 0.5;
        	if (j < p/2) {
        		hex = 0.5 - (p-j)/p * 0.5;
        	}
            leg.path([["M", xi + 100, yi - R * 4], ["A", R * 4, R * 4, 0, + (alpha > 180), 1, x, y]]).attr({
                stroke: Raphael.hsb(hex, 1, 0.85),
                transform: "r" + [180 / p * j - 90, xi + 100, yi],
                "stroke-width": sw * 4
            });
        }
        leg.text(xi + 100, 100, "UNIT COUNTERL").attr(labelAttr);
        var ln = leg.path(["M", xi + 100, yi - 5 * 4, "L", xi + 100 + 4 * 4, yi - 10 * 4, "L", xi + 100, yi - 20 * 4, "L", xi + 100 - 4 * 4, yi - 10 * 4]).attr({
            fill: "#333",
            stroke: "none",
            cursor: "move"
        });

		$("#counter").click(function () {
			$(".target").hide();
			$("#counter-legend").fadeIn();
		});
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
		NEEDLES[id].animate({transform: "r" + [value/parts * 180, xi, y]}, 1000);
		TEXTS[id].attr({text: v});
	}
}