(function (Raphael) {
    Raphael.colorwheel = function (size) {
        return new ColorWheel(size);
    };
    var pi = Math.PI,
        labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
        cursorAttr = { fill: "#222", stroke: "none", cursor: "move" };

        ColorWheel = function (size) {
            var t = this,
                parts = 5,
                w3 = 3.5 * size / 200,
                size1 = size / 9,
                size2 = size / 2.4,
                center = size / 2,
                segments = parts * 15,
                padding = size1 * 1.3;

            var r = Raphael(0, 0, size, size * 2);
            t.center = center;
            var a = pi / 2 - pi * 2 / segments * 1.3 / 2,
                R1 = center - padding,
                R2 = R1 - size1 * 2,
                path = ["M", center, padding, "A", R1, R1, 0, 0, 1, R1 * Math.cos(a) + R1 + padding, R1 - R1 * Math.sin(a) + padding, "L", R2 * Math.cos(a) + R1 + padding, R1 - R2 * Math.sin(a) + padding, "A", R2, R2, 0, 0, 0, center, padding + size1 * 2, "z"].join();
            
            for (var i = 0; i < segments; i++) {
                var fill = i * (150 / segments) / 255;
                if (i > segments / 2) {
                    fill = (segments - i) * (150 / segments) / 255;
                }
                r.path(path).attr({
                    stroke: "none",
                    fill: Raphael.hsb(fill, .9, .78),
                    transform: "r" + [(180 / segments) * i - 90, center, center]
                });
            }
            t.cur = r.path(["M", center, size2, "L", center + w3 * 3, size2 - w3 * 4, "L", center, size2 - w3 * 12, "L", center - w3 * 3, size2 - w3 * 4]).attr(cursorAttr);
            t.cur.drag(function (dx, dy, x, y) {
                t.setH(x - center, y - center);
            });
            r.text(center, 5, "UNIT COUNTER").attr(labelAttr).attr({"font-size": "13px", "font-weight": "bold"});
            r.text(center, 28,  "0").attr(labelAttr).attr({transform: "r" + [-90 * 5 / parts,   center, center] });
            r.text(center, 28, "36").attr(labelAttr).attr({transform: "r" + [-90 * 3 / parts,   center, center] });
            r.text(center, 28, "41").attr(labelAttr).attr({transform: "r" + [-90 * 1 / parts,   center, center] });
            r.text(center, 28, "49").attr(labelAttr).attr({transform: "r" + [ 90 * 1 / parts,   center, center] });
            r.text(center, 28, "51").attr(labelAttr).attr({transform: "r" + [ 90 * 3 / parts,   center, center] }); 
            r.text(center, 28, "63").attr(labelAttr).attr({transform: "r" + [ 90 * 5 / parts,   center, center] });
            t.lab = r.text(center, 150, "Drag the needle").attr(labelAttr);
            r.text(6, 230, "0-35: You need at least 36 units\n36-40: You may not be able to drop a course\n41-48: Your course load is healthy\n49-50: You are piling too much on your plate\n51-63: You need permissions if QPA < 3.0").attr(labelAttr).attr({"text-anchor": "start"});
        },
        proto = ColorWheel.prototype;
    proto.setH = function (x, y) {
        var labels = ["Underload", "Risky", "Healthy", "Overload", "Permissions"];
        var d = Raphael.angle(x, y, 0, 0);
        if (d < 90) { d = 360 } else if (d < 180) { d = 180 };
        var i = Math.floor((d - 180) / 36);
        if (i > 4) { i = 4 };
        this.cur.attr({transform: "r" + [d + 90, this.center, this.center]});
        this.lab.attr({text: labels[i]});
    };
})(window.Raphael);
