function Counter() {
	var NEEDLES = [];
	var TEXTS = [];
	var r = Raphael("counter", 45, 580),
		leg = Raphael("counter-legend", 255, 300),
		R = 15, 	// radius of circle 
		xi = 20, 	// x position
		sw = 12, 	// stroke-width
		parts = 5, 	// number of stats
		hues = [0, .16, .35, .16, 0],
		bris = [.9, .9, .85, .9, .75],
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
		circleAttr = { fill: "#555", stroke: "none" };
	addObj();

	function addObj(){
		var p = parts,
			alpha = 180 / p,
			a = (90 - alpha) * Math.PI / 180;
		
		for (var i = 1; i <= 8; i++) {
			var yi = i * 75 - 50,
				x = xi + R * Math.cos(a),
				y = yi - R * Math.sin(a),
				path = [["M", xi, yi - R], ["A", R, R, 0, + (alpha > 180), 1, x, y]];
	        for (var j = 0; j < p; j++) {
	            r.path(path).attr({
	                stroke: Raphael.hsb(hues[j], 1, bris[j]),
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
			x = xi + 100 + R * 4 * Math.cos(a),
			y = yi - R * 4 * Math.sin(a);

		for (var j = 0; j < p; j++) {
            leg.path([["M", xi + 100, yi - R * 4], ["A", R * 4, R * 4, 0, + (alpha > 180), 1, x, y]]).attr({
                stroke: Raphael.hsb(hues[j], 1, bris[j]),
                transform: "r" + [180 / p * j - 90, xi + 100, yi],
                "stroke-width": sw * 4
            });
        }
        leg.text(xi + 100, 20, "UNIT COUNTER").attr(labelAttr);

        leg.text(xi + 100, 30, "36").attr(labelAttr).attr({transform: "r" + [-270 / p, xi + 100, yi] });
        leg.text(xi + 100, 30, "46").attr(labelAttr).attr({transform: "r" + [-90 / p, xi + 100, yi] });
        leg.text(xi + 100, 30, "52").attr(labelAttr).attr({transform: "r" + [90 / p, xi + 100, yi] });
        leg.text(xi + 100, 30, "64").attr(labelAttr).attr({transform: "r" + [270 / p, xi + 100, yi] });

        leg.circle(xi + 40, 130, 3).attr(circleAttr);
        leg.text(xi + 40 + 2, 130, "underload").attr(labelAttr).attr({"text-anchor": "start"});
        leg.path([["M", xi + 40, 130], ["L", xi + 40, 260]]).attr({ stroke: "#555" });

        leg.circle(xi + 70, 100, 3).attr(circleAttr);
        leg.text(xi + 70 + 2, 120, "risky").attr(labelAttr).attr({"text-anchor": "start"});
        leg.path([["M", xi + 70, 100], ["L", xi + 70, 240]]).attr({ stroke: "#555" });

        leg.circle(xi + 100, 90, 3).attr(circleAttr);
        leg.text(xi + 100 + 2, 110, "healthy").attr(labelAttr).attr({"text-anchor": "start"});
        leg.path([["M", xi + 100, 90], ["L", xi + 100, 220]]).attr({ stroke: "#555" });

        leg.circle(xi + 130, 100, 3).attr(circleAttr);
        leg.text(xi + 130 + 2, 100, "overload").attr(labelAttr).attr({"text-anchor": "start"});
        leg.path([["M", xi + 130, 100], ["L", xi + 130, 200]]).attr({ stroke: "#555" });

        leg.circle(xi + 160, 130, 3).attr(circleAttr);
        leg.text(xi + 160 + 2, 90, "permissions").attr(labelAttr).attr({"text-anchor": "start"});
        leg.path([["M", xi + 160, 130], ["L", xi + 160, 180]]).attr({ stroke: "#555" });

		$("#counter").click(function () {
			$(".target").hide();
			if ($("#counter-legend").is(":visible")) {
				$("#counter-legend").fadeOut();
			} else {
				$("#counter-legend").fadeIn();
			}
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
		if (value == 0) {
			NEEDLES[id].animate({transform: "r" + [value/parts * 180, xi, y]}, 1000);
		} else {
			NEEDLES[id].animate({transform: "r" + [value/parts * 180 - (90/parts), xi, y]}, 1000);
		}		
		TEXTS[id].attr({text: v});
	}
}