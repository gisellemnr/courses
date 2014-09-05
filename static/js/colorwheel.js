(function (Raphael) {
    Raphael.colorwheel = function (size) {
        return new ColorWheel(size);
    };
    Raphael.setWheel = function (cw, num, i) {
        var labels = ["Underload", "Underload", "Risky", "Healthy", "Overload", "Permissions"];
        var parts = 5;
		var fill = "#222";
		if (i == 0 || i == 1) {
			fill = "#669999";
		}
        cw.lab.attr({text: labels[i]});
        cw.num.attr({text: num});
        if (i == 0) {
            cw.cur.animate({transform: "r" + [- 90, cw.center, cw.center], fill: fill}, 900);
        } else {
            cw.cur.animate({transform: "r" + [i/parts * 180 - (90/parts) - 90, cw.center, cw.center], fill: fill}, 900);
        }  
    };
    var pi = Math.PI,
        labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
        cursorAttr = { fill: "#222", stroke: "none" },
        ColorWheel = function (size) {
            var t = this,
                parts = 5,
                w3 = 3.5 * size / 200,
                size1 = size / 9,
                size2 = size / 2.4,
                center = size / 2,
                segments = parts * 15,
                padding = size1 * 1.3;

            var r = Raphael('iframe', size, size * 2);
            t.center = center;
            var a = pi / 2 - pi * 2 / segments * 1.3 / 2,
                R1 = center - padding,
                R2 = R1 - size1 * 2,
                path = ["M", center, padding, "A", R1, R1, 0, 0, 1, R1 * Math.cos(a) + R1 + padding, R1 - R1 * Math.sin(a) + padding, "L", R2 * Math.cos(a) + R1 + padding, R1 - R2 * Math.sin(a) + padding, "A", R2, R2, 0, 0, 0, center, padding + size1 * 2, "z"].join();
            
            for (var i = 0; i < segments; i++) {
				var fill;
				if (i < segments / 5) {
					fill = (150 / segments) / 255;
				} else if (i < segments / 2) {
					fill = i * (150 / segments) / 255;
				} else {
					fill = (segments - i) * (150 / segments) / 255;
				}
                r.path(path).attr({
                    stroke: "none",
                    fill: Raphael.hsb(fill, .9, .78),
                    transform: "r" + [(180 / segments) * i - 90, center, center]
                });
            }
            t.cur = r.path(["M", center, size2, "L", center + w3 * 3, size2 - w3 * 4, "L", center, size2 - w3 * 12, "L", center - w3 * 3, size2 - w3 * 4]).attr(cursorAttr);
            t.num = r.text(center, 120, "").attr(labelAttr).attr({"font-size": "18px", "font-weight": "bold"});
            t.lab = r.text(center, 160, "").attr(labelAttr);
            
            r.text(center, 5, "UNIT COUNTER").attr(labelAttr).attr({"font-size": "13px", "font-weight": "bold"});
            r.text(center, 28,  "0").attr(labelAttr).attr({transform: "r" + [-90 * 5 / parts,   center, center] });
            r.text(center, 28, "36").attr(labelAttr).attr({transform: "r" + [-90 * 3 / parts,   center, center] });
            // r.text(center, 28, "41").attr(labelAttr).attr({transform: "r" + [-90 * 1 / parts,   center, center] });
            r.text(center, 28, "45").attr(labelAttr).attr({transform: "r" + [ 90 * 0 / parts,   center, center] });
            // r.text(center, 28, "49").attr(labelAttr).attr({transform: "r" + [ 90 * 1 / parts,   center, center] });
            r.text(center, 28, "51").attr(labelAttr).attr({transform: "r" + [ 90 * 3 / parts,   center, center] }); 
            r.text(center, 28, "63").attr(labelAttr).attr({transform: "r" + [ 90 * 5 / parts,   center, center] });
            r.text(5, 230, " 0-35").attr(labelAttr).attr({"text-anchor": "start", "font-weight": "bold"});
            r.text(5, 260, "36-40").attr(labelAttr).attr({"text-anchor": "start", "font-weight": "bold"});
            r.text(5, 290, "41-48").attr(labelAttr).attr({"text-anchor": "start", "font-weight": "bold"});
            r.text(5, 320, "49-50").attr(labelAttr).attr({"text-anchor": "start", "font-weight": "bold"});
            r.text(5, 370, "51-63").attr(labelAttr).attr({"text-anchor": "start", "font-weight": "bold"});

            r.text(45, 230, "You need at least 36 units").attr(labelAttr).attr({"text-anchor": "start" });
            r.text(45, 260, "You may not be able to drop a course").attr(labelAttr).attr({"text-anchor": "start" });
            r.text(45, 290, "Your course load is healthy").attr(labelAttr).attr({"text-anchor": "start" });
            r.text(45, 320, "You may be piling").attr(labelAttr).attr({"text-anchor": "start" });
            r.text(45, 340, "too much on your plate").attr(labelAttr).attr({"text-anchor": "start" });
            r.text(45, 370, "You need permissions").attr(labelAttr).attr({"text-anchor": "start" });
            r.text(45, 390, "if your QPA is less than 3.0").attr(labelAttr).attr({"text-anchor": "start" });
        };
})(window.Raphael);
