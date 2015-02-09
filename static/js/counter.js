function Counter(r) {
	var NEEDLES = [];
	var TEXTS = [];
	var R = 15, 	// radius of circle 
		xi = 750, 	// x position
		sw = 12, 	// stroke-width
		parts = 5, 	// number of stats
		labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
		circleAttr = { fill: "#555", stroke: "none" },
		cursorAttr = { fill: "#222", stroke: "none", cursor: "move" },
		cw = Raphael.colorwheel(250),
		ct = -1;	
	addObj();

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
	        txt.tooltitle = r.text(xi - 62, yi, "Unit counter\nClick for details").attr({
				stroke: "none",
				fill: "#fff"
			});
			txt.tooltip = r.path(getTooltipPath(txt.tooltitle, 'left', 1)).attr({
				fill: '#000'
			});
			txt.tooltitle.hide();
			txt.tooltip.hide();
			TEXTS.push(txt);
			for (var j = 0; j < p; j++) {
	        	var fill;
				if (j < p / 5) {
					fill = (150 / p) / 255;
				} else if (j < p / 2) {
					fill = j * (150 / p) / 255;
				} else {
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
					TEXTS[t].tooltip.show().toFront();
					TEXTS[t].tooltitle.show().toFront();
	            }, function (e) {
	            	var t = Math.round((e.pageY + 50) / 75) - 1;
	            	TEXTS[t].tooltitle.hide();
					TEXTS[t].tooltip.hide();
				});
				rainbow.click(function(e) {
					var t = Math.round((e.pageY + 50) / 75) - 1;
					showHideLegend(t);
				});
	        }
			var needle = r.path(["M", xi, yi - 5, "L", xi + 4, yi - 10, "L", xi, yi - 20, "L", xi - 4, yi - 10]).attr({
                fill: "#333",
                stroke: "none"
            });
            NEEDLES.push(needle);
		}
	}

	function showHideLegend(t){
		$(".target").hide();
		if (t == ct) {
			if ($("#iframe").css('visibility') === 'visible') {
				$("#iframe").css('visibility', 'hidden');
			} else {
				$("#iframe").css('visibility', 'visible');
			}
		} else {
			$("#iframe").css('visibility', 'visible');
			ct = t;
			Raphael.setWheel(cw, TEXTS[t].attrs.text, TEXTS[t].value);
		}
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
		var fill = "#222";
		if (value == 0 || value == 1) {
		    fill = "#5bc0de";
		}
		if (value == 0) {
			NEEDLES[id].animate({transform: "r" + [0, xi, y], fill:fill}, 1000);
		} else {
			NEEDLES[id].animate({transform: "r" + [value/parts * 180 - (90/parts), xi, y], fill:fill}, 1000);
		}		
		TEXTS[id].attr({text: v});
		TEXTS[id].value = value;
	}
}