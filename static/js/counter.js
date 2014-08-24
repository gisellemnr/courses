function Counter() {
	var NEEDLES = [];
	var TEXTS = [];
	var r = Raphael("counter", 130, 580),
		R = 15, 	// radius of circle 
		xi = 105, 	// x position
		sw = 12, 	// stroke-width
		parts = 5, 	// number of stats
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
		circleAttr = { fill: "#555", stroke: "none" };
	
	addObj();
	legend("counter-legend", 250);

	function addObj() {
		var p = 80,
			alpha = 180 / p,
			a = (90 - alpha) * Math.PI / 180;
		for (var i = 1; i <= 8; i++) {
			var yi = i * 75 - 50,
				x = xi + R * Math.cos(a),
				y = yi - R * Math.sin(a),
				path = [["M", xi, yi - R], ["A", R, R, 0, + (alpha > 180), 1, x, y]];
	        var txt = r.text(xi - 5, yi, 0).attr(labelAttr);
	        txt.tooltitle = r.text(41, yi, "Unit counter\nClick for details").attr({
				stroke: "none",
				fill: "#fff"
			});
			txt.tooltip = r.path(getTooltipPath(txt.tooltitle, 'left', 1)).attr({
				fill: '#000'
			});
			txt.tooltitle.toFront();
			txt.tooltitle.hide();
			txt.tooltip.hide();
			TEXTS.push(txt);
			for (var j = 0; j < p; j++) {
	        	var fill = j * (150 / p) / 255;
                if (j > p / 2) {
                    fill = (p - j) * (150 / p) / 255;
                }
	            var rainbow = r.path(path).attr({
	            	stroke: Raphael.hsb(fill, 1, .78),
	                transform: "r" + [alpha * j, xi, yi],
	                "stroke-width": sw,
	                cursor: "pointer"
	            });
	            rainbow.hover(function (e) {
	            	for (var k = 0; k < 8; k++) {
	            		TEXTS[k].tooltitle.hide();
						TEXTS[k].tooltip.hide();
	            	}
	            	var t = Math.round((e.pageY + 50) / 75) - 1;
	            	TEXTS[t].tooltitle.show();
					TEXTS[t].tooltip.show();
	            }, function (e) {
	            	var t = Math.round((e.pageY + 50) / 75) - 1;
	            	TEXTS[t].tooltitle.hide();
					TEXTS[t].tooltip.hide();
				});
	        }
			var needle = r.path(["M", xi, yi - 5, "L", xi + 4, yi - 10, "L", xi, yi - 20, "L", xi - 4, yi - 10]).attr({
                fill: "#333",
                stroke: "none"
            });
            NEEDLES.push(needle);
		}
		$("#counter").click(function () {
			$(".target").hide();
			if ($("#counter-legend").is(":visible")) {
				$("#counter-legend").fadeOut();
			} else {
				$("#counter-legend").fadeIn();
			}
		});
	}

	function legend(el, size) {
		var pi = Math.PI,
        	labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
		    cursorAttr = { fill: "#222", stroke: "none", cursor: "move" },
            parts = 5,
            w3 = 3.5 * size / 200,
            size20 = size / 10,
            size2 = size / 2,
            size4 = size / 2.4,
            segments = parts * 15,
            padding = size20 * 1.8,
            t = this;
		var r = Raphael(el, size, size * 2);
		t.size2 = size2;
		var a = pi / 2 - pi * 2 / segments * 1.3 / 2,
		    R = size2 - padding,
		    R2 = R - size20 * 2,
		    path = ["M", size2, padding, "A", R, R, 0, 0, 1, R * Math.cos(a) + R + padding, R - R * Math.sin(a) + padding, "L", R2 * Math.cos(a) + R + padding, R - R2 * Math.sin(a) + padding, "A", R2, R2, 0, 0, 0, size2, padding + size20 * 2, "z"].join();
		for (var i = 0; i < segments; i++) {
		    var fill = i * (150 / segments) / 255;
		    if (i > segments / 2) {
		        fill = (segments - i) * (150 / segments) / 255;
		    }
		    r.path(path).attr({
		        stroke: "none",
		        fill: Raphael.hsb(fill, .9, .78),
		        transform: "r" + [(180 / segments) * i - 90, size2, size2]
		    });
		}
		t.cur = r.path(["M", size2, size4, "L", size2 + w3 * 3, size4 - w3 * 4, "L", size2, size4 - w3 * 12, "L", size2 - w3 * 3, size4 - w3 * 4]).attr(cursorAttr);
		t.cur.drag(function (dx, dy, x, y) {
		    setH(x - t.size2 - 10, y - t.size2 - 150, t);
		});
		var pad = window.screenY;
		r.text(size2, 5 - pad, "UNIT COUNTER").attr(labelAttr).attr({"font-size": "14px", "font-weight": "bold"});
		r.text(size2, size20 - 5 - pad, "0").attr(labelAttr).attr({transform: "r" + [-90 * 5 / parts,   size2, size2] });
		r.text(size2, size20 - 5 - pad, "36").attr(labelAttr).attr({transform: "r" + [-90 * 3 / parts,   size2, size2] });
		r.text(size2, size20 - 5 - pad, "41").attr(labelAttr).attr({transform: "r" + [-90 / parts,    size2, size2] });
		r.text(size2, size20 - 5 - pad, "49").attr(labelAttr).attr({transform: "r" + [90 / parts,     size2, size2] });
		r.text(size2, size20 - 5 - pad, "51").attr(labelAttr).attr({transform: "r" + [90 * 3 / parts,    size2, size2] });
		r.text(size2, size20 - 5 - pad, "63").attr(labelAttr).attr({transform: "r" + [90 * 5 / parts,   size2, size2] });
		t.leg = r.text(size2, 80 - pad, "Drag the needle").attr(labelAttr);
		r.text(10, 100, " 0-35: You need at least 36 units\n36-40: You may not be able to drop a course\n41-48: Healthy load\n49-50: You are piling too much on your plate\n51-63: requires permission if QPA < 3.0").attr(labelAttr).attr({"text-anchor": "start"});
	}

	function setH(x, y, t) {
		var labels = ["Underload", "Risky", "Healthy", "Overload", "Permissions"];
        var d = Raphael.angle(x, y, 0, 0);
        if (d < 90) { d = 360 }
        else if (d < 180) { d = 180 };
        var i = Math.floor((d - 180) / 36);
        if (i > 4) { i = 4 };
        t.cur.attr({transform: "r" + [d + 90, this.size2, this.size2]});
        t.leg.attr({text: labels[i], y: 155});
    }

	this.updateVal = function (i, v) {
		var value;
		if (v < 1) {
			value = 0;
		} else if (v < 36) {
			value = 1;
		} else if (v < 41) {
			value = 2;
		} else if (v < 49) {
			value = 3;
		} else if (v < 51) {
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