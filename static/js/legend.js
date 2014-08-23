(function (Raphael) {
    Raphael.colorwheel = function (el, size) {
        return new ColorWheel(el, size);
    };
    var pi = Math.PI,
        labels = ["underload", "risky", "healthy", "overload", "permissions"];
        ColorWheel = function (el, size) {
            var parts = 5,
                w3 = 3.5 * size / 200,
                size20 = size / 10,
                size2 = size / 2,
                size4 = size / 2.4,
                segments = parts * 15,
                padding = size20 * 1.8,
                t = this;
            var labelAttr = { stroke: "none", fill: "grey", "font-size": "12px" },
                cursorAttr = { fill: "#222", stroke: "none", cursor: "move" };
            var r = Raphael(el, size, size);
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
                t.setH(x - t.size2 - 10, y - t.size2 - 150);
            });
            r.text(size2, 5, "UNIT COUNTER").attr(labelAttr).attr({"font-size": "14px", "font-weight": "bold"});
            r.text(size2, size20 - 5, "36").attr(labelAttr).attr({transform: "r" + [-270 / parts,   size2, size2] });
            r.text(size2, size20 - 5, "46").attr(labelAttr).attr({transform: "r" + [-90 / parts,    size2, size2] });
            r.text(size2, size20 - 5, "52").attr(labelAttr).attr({transform: "r" + [90 / parts,     size2, size2] });
            r.text(size2, size20 - 5, "64").attr(labelAttr).attr({transform: "r" + [270 / parts,    size2, size2] });
            t.leg = r.text(size2, 80, "Drag the needle").attr(labelAttr);
        },
        proto = ColorWheel.prototype;
    proto.setH = function (x, y) {
        var d = Raphael.angle(x, y, 0, 0);
        if (d < 90) { d = 360 }
        else if (d < 180) { d = 180 };
        var i = Math.floor((d - 180) / 36);
        if (i > 4) { i = 4 };
        this.cur.attr({transform: "r" + [d + 90, this.size2, this.size2]});
        this.leg.attr({text: labels[i], y: 155});
    };
})(window.Raphael);