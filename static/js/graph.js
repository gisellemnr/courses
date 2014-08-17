$.dbGET = function(action, data, callback) {
	$.get('/course-planner/private/data.php?action='+action,data,callback,'json');
}

function Graph(semesters) {
	var graph = this;
	var hidden = false;
	var counter = new Counter();

	// y is the cy value of the semester
	// shape is the shape newly moved that must be repositioned
	// effect if true, allows courses to slide
	function position(y, shape, effect) { 
		var list = [];
		var x = 0;
		if (shape){
			x = shape.attrs.cx;
		}
		for (s in shapes) {
			if (shapes[s].attrs.cy == y && shape != shapes[s] && shapes[s].attrs.r == 20){
				if (shape){
					// to prevent shapes from overlapping
					if (Math.abs(x - shapes[s].attrs.cx) < shape.attrs.r * 2) {
						if (x < shapes[s].attrs.cx) {
							x = shapes[s].attrs.cx - shape.attrs.r * 2 - 2;
						} else {
							x = shapes[s].attrs.cx + shape.attrs.r * 2 + 2;
						}
					}
				} else {
					// to position the entire row of shapes
					list.push(shapes[s]);
				}
			}
		}
		if (shape) {
			list.push(shape);
			shape.clicked = false;
		}
		list.sort(function (a, b) {
			return a.attrs.cx - b.attrs.cx
		});
		var alpha = (700 - (700 * (list.length - 1) / list.length)) / 2;
		for (index in list) {
			if (shape) {
				list[index].animate({
					cx: x,
					cy: y
				}, 100);
				list[index].pair.animate({
					x: x,
					y: y
				}, 100);
				for (var i = connections.length; i--;) {
					r.reconnect(connections[i], list[index], x, y);
				}
			} else {
				x = 700 / list.length * index + alpha;
				if (effect) {
					list[index].animate({
						cx: x,
						cy: y
					}, 100);
					list[index].pair.animate({
						x: x,
						y: y
					}, 100);
				} else {
					list[index].attr({
						cx: x,
						cy: y
					});
					list[index].pair.attr({
						x: x,
						y: y
					});
				}
				for (var i = connections.length; i--;) {
					if (effect) {
						r.reconnect(connections[i], list[index], x, y);
					} else if (connections[i].from.id == list[index].id || connections[i].to.id == list[index].id) {
						r.connect(connections[i]);
					}
				}
			}
		}
	}

	function createShape(course) {
		var shape = r.circle(course.x, course.y, 20);
		var label = r.text(course.x, course.y, course.id);
		shape.id = course.id;
		shape.area = course.area;
		shape.color = course.color;
		shape.number = course.id.replace('-', '');
		shape.website = course.link;
		shape.description = course.description;
		shape.holder = course.holder;
		shape.replaced = true;
		if (!shape.description) {
			shape.description = 'Description unavailable.';
		}
		shape.attr({
			fill: shape.color,
			stroke: shape.color,
			"stroke-width": 2,
			cursor: "move",
			"fill-opacity": shape.area == "placeholder"? 0.5 : 0.7
		}).toFront();
		label.attr({
			stroke: "none",
			fill: "#fff",
			cursor: "move"
		}).toFront();
		shape.drag(move, dragger, up);
		label.drag(move, dragger, up);
		$.each(course.dependencies, function (j, c) {
			if (c) {
				connections.push(r.connect(r.getById(shape.id), r.getById(c)));
			}
		});
		if (!course.title) {
			getCourseInformation(shape.number, function (data) {
				if (data && data.course) {
					shape.title = data.course.name.replace(':', '');
					shape.units = data.course.units;
				}
			});
		} else {
			shape.title = course.title;
			shape.units = course.units;
		}
		shape.tooltip(shape.title);
		label.pair = shape;
		label.tooltip(shape.title);
		shape.pair = label;
		return shape;
	}

	this.reposition = function (course, x, y) {
		var shape = r.getById(course);
		shape.attr({
			cx: x,
			cy: y
		});
		shape.pair.attr({
			x: x,
			y: y
		});
		for (var i = connections.length; i--;) {
			if (connections[i].from.id == shape.id || connections[i].to.id == shape.id) {
				r.connect(connections[i]);
			}
		}
		r.safari();
	}

	this.addCourse = function (course, init) {
		var dependencies = course.dependencies;
		for (var i = dependencies.length; i--;) {
			if (cours.indexOf(dependencies[i]) == -1 && dependencies[i] != "") {
				alert('You must add ' + dependencies[i] + ' first.');
				return;
			}
		}
		var id = course.id;
		if (cours.indexOf(id) == -1) {
			course.x = 710;
			course.y = 25;
			for (var i = shapes.length; i--;) {
				if (shapes[i].area == "placeholder" && !shapes[i].hidden 
					&& shapes[i].color == course.color) {
					course.x = shapes[i].attrs.cx;
					course.y = shapes[i].attrs.cy;
					course.holder = shapes[i];
					hide(shapes[i]);
				}
			}
			var c = new createShape(course);
			c.replaced = false;
			shapes.push(c);
			labels.push(c.pair);
			cours.push(c.id);
			if (!c.holder) {
				if (init) {
					position(25, null, false);
				} else {
					position(25, null, true);
				}
			}
			$('#coursenum').typeahead('destroy');
			$('#coursenum').typeahead({
				local: cours.sort()
			});
		} else {
			alert(id + ' is already in your course planner.');
		}
		updateCounters();
	}

	this.getContent = function () {
		result = {};
		for (var i = shapes.length; i--;) {
			result[shapes[i].id] = {
				area: shapes[i].area,
				cx: shapes[i].attrs.cx,
				cy: shapes[i].attrs.cy
			}
		}
		return result;
	}

	function removeCourse(course) {
		for (var i = connections.length; i--;) {
			if (connections[i].from.id == course.id || connections[i].to.id == course.id) {
				connections[i].line.remove();
				connections[i].arrow.remove();
				connections.splice(i, 1);
			}
		}
		cours.splice(cours.indexOf(course.id), 1);
		shapes.splice(shapes.indexOf(course), 1);
		labels.splice(labels.indexOf(course.pair), 1);
		course.pair.remove();
		course.remove();
		$('#coursenum').typeahead('destroy');
		$('#coursenum').typeahead({
			local: cours
		});
	}

	function findCourse() {
		var courses = ($.trim($("#coursenum").val())).split(' ');
		if (courses.length > 0) {
			$("#remove").show();
		}
		if ($("#coursenum").val().length == 0) {
			$("#remove").hide();
		}
		var shapes = [];
		$.each(courses, function (i, course) {
			var shape = r.getById(course);
			if (shape && shape.type == 'circle') {
				shapes.push(shape);
			}
		});
		if (shapes.length == 0) {
			unselectCourse();
		} else {
			selectCourse(shapes);
		}
	}

	function selectCourse(list, hide) {
		for (var i = shapes.length; i--;) {
			shapes[i].animate({
				"fill-opacity": .1,
				"stroke-width": .5
			}, 300);
		}
		for (var i = connections.length; i--;) {
			connections[i].line.animate({
				"stroke-width": 0
			}, 300);
			connections[i].arrow.animate({
				opacity: 0
			}, 300);
		}
		if (list.length == 1 && list[0].replaced == false) {
			for (var i = shapes.length; i--;) {
				if (shapes[i].area == "placeholder") {
					list.push(shapes[i]);
				}
			}
		}
		$.each(list, function (i, shape) {
			shape.animate({
				"fill-opacity": 1
			}, 500);
			for (var i = connections.length; i--;) {
				if (connections[i].from.id == shape.id || connections[i].to.id == shape.id) {
					connections[i].line.animate({
						stroke: shape.attrs.fill,
						"stroke-width": 1.5
					}, 500);
					connections[i].arrow.animate({
						stroke: shape.attrs.fill,
						fill: shape.attrs.fill,
						opacity: 1
					}, 500);
					connections[i].from.animate({
						"fill-opacity": 1
					}, 500);
					connections[i].to.animate({
						"fill-opacity": 1
					}, 500);
				}
			}
		});
		if (!hide) {
			var last = list[list.length - 1];
			var isNew = $('#number').html() != last.id;
			$('#number').html(last.id);
			if (isNew) {
				$("#link").hide();
				$('#title').html(last.title);
				$('#description').html(last.description);
				$('#units').html('<b>Units:</b> ' + last.units);
				if (last.website) {
					$("#link").show();
					$('#link').unbind("click").click(function () {
						window.open(last.website, '_blank');
					});
				}
			}
		}
		$('article').mCustomScrollbar({
			theme: "rounded-dots-dark"
		});
	}

	function unselectCourse() {
		for (var i = shapes.length; i--;) {
			shapes[i].animate({
				"fill-opacity": shapes[i].area == "placeholder"? 0.5 : 0.7,
				"stroke-width": 2
			}, 500);
		}
		for (var i = connections.length; i--;) {
			connections[i].line.animate({
				stroke: "#333",
				"stroke-width": 1.5
			}, 200);
			connections[i].arrow.animate({
				stroke: "#333",
				fill: "#333",
				opacity: 1
			}, 200);
		}
	}

	function selectColor(color) {
		var list = [];
		for (var i = shapes.length; i--;) {
			if (hex2rgb(shapes[i].color).toString() == color) {
				list.push(shapes[i]);
			}
		}
		selectCourse(list, true);
	}

	function showHidePlaceholders() {
		for (var i = shapes.length; i--;) {
			if (shapes[i].area == "placeholder") {
				if (hidden) {
					shapes[i].show();
					shapes[i].pair.show();
				} else {
					shapes[i].hide();
					shapes[i].pair.hide();
				}
			}
		}
		hidden = !hidden;
	}

	function hide(shape) {
		shape.hidden = true;
		shape.pair.hide();
		shape.animate({ r: 0 }, 1000);
	}

	function show(shape) {
		shape.hidden = false;
		shape.pair.show();
		shape.animate({ r: 20 }, 1000);
	}

	var dragger = function () {
		var shape = this;
		if (this.type == 'text') {
			shape = this.pair;
		}
		shape.toFront();
		shape.pair.toFront();
		selectCourse([shape]);
		shape.ox = shape.attrs.cx;
		shape.oy = shape.attrs.cy;
		if (shape.area != 'core' && shape.area != "placeholder") {
			r.getById('del').animate({
				opacity: 1
			}, 100);
			r.getById('del').label.animate({
				opacity: 1
			}, 100);
			r.getById('del').tooltip.show().toFront();
			r.getById('del').text.show().toFront();
		}
		shape.clicked = true;
		if (shape.title) {
			shape.tooltitle.hide();
			shape.tooltip.hide();
		}
		if (shape.holder) {
			shape.holder.hidden = false;
			shape.holder = null;
		}
	},
	move = function (dx, dy) {
		var shape = this;
		if (this.type == 'text') {
			shape = this.pair;
		}
		var ylimit = shape.oy + dy;
		var xlimit = shape.ox + dx;
		var rcon = 0;
		var lcon = 1000;
		for (var i = connections.length; i--;) {
			if (connections[i].to.id == shape.id) {
				if (ylimit - connections[i].from.attrs.cy < 75) {
					if (connections[i].from.attrs.cy > rcon) {
						rcon = connections[i].from.attrs.cy;
					}
				}
			}
			if (connections[i].from.id == shape.id) {
				if (connections[i].to.attrs.cy - ylimit < 75) {
					if (connections[i].to.attrs.cy < lcon) {
						lcon = connections[i].to.attrs.cy;
					}
				}
			}
		}
		if (rcon > 0) {
			dy = rcon - shape.oy + 75;
		}
		if (lcon < 1000) {
			dy = lcon - shape.oy - 75;
		}
		if (ylimit > 550 && lcon == 1000) {
			dy = 550 - shape.oy;
		}
		if (ylimit < 25 && rcon == 0) {
			dy = 25 - shape.oy;
		}
		if (xlimit > 680) {
			dx = 680 - shape.ox;
		}
		if (xlimit < 20) {
			dx = 20 - shape.ox;
		}
		var att = {
			cx: shape.ox + dx,
			cy: shape.oy + dy
		};
		shape.attr(att);
		shape.pair.attr({
			x: shape.attrs.cx,
			y: shape.attrs.cy
		});
		for (var i = connections.length; i--;) {
			if (connections[i].from.id == shape.id || connections[i].to.id == shape.id) {
				r.connect(connections[i]);
			}
		}
		r.safari();
		var inter = Raphael.pathIntersection(getCircletoPath(650, 25, 20), getCircletoPath(shape.attrs.cx, shape.attrs.cy, 20))[0];
		if (inter) {
			r.getById('del').animate({
				r: 25
			}, 200);
		} else {
			r.getById('del').animate({
				r: 20
			}, 200);
		}
		if (shape.area != 'core' && shape.area != "placeholder") {
			for (var i = shapes.length; i--;) {
				if (shapes[i].area == "placeholder" && !shapes[i].hidden) {
					shapes[i].pair.show();
					var inters = Raphael.pathIntersection(getCircletoPath(shapes[i].attrs.cx, shapes[i].attrs.cy, 20), getCircletoPath(shape.attrs.cx, shape.attrs.cy, 20))[0];
					if (inters) {
						shapes[i].animate({
							r: 25
						}, 200);
					} else {
						shapes[i].animate({
							r: 20
						}, 200);
					}
				}
			}

		}
	},
	up = function () {
		var shape = this;
		if (this.type == 'text') {
			shape = this.pair;
		}
		r.getById('del').animate({
			opacity: 0
		}, 100);
		r.getById('del').label.animate({
			opacity: 0
		}, 100);
		r.getById('del').text.hide();
		r.getById('del').tooltip.hide();
		for (var i = shapes.length; i--;) {
			if (shapes[i].area == "placeholder" && shapes[i].attrs.r > 24.9) {
				hide(shapes[i]);
				shape.holder = shapes[i];
			}
		}
		if (r.getById('del').attrs.r == 25 && shape.area != 'core' && shape.area != 'placeholder') {
			removeCourse(shape);
		} else if (shape.attrs.cy <= 62.5) {
			position(25, shape);
		} else if (shape.attrs.cy <= 137.5) {
			position(100, shape);
		} else if (shape.attrs.cy <= 212.5) {
			position(175, shape);
		} else if (shape.attrs.cy <= 287.5) {
			position(250, shape);
		} else if (shape.attrs.cy <= 362.5) {
			position(325, shape);
		} else if (shape.attrs.cy <= 437.5) {
			position(400, shape);
		} else if (shape.attrs.cy <= 512.5) {
			position(475, shape);
		} else {
			position(550, shape);
		}
		r.getById('del').animate({
			r: 20
		});
		unselectCourse();
		setTimeout(function(){
			updateCounters();
			$.dbGET('setUser', { json: JSON.stringify(graph.getContent()) });
		}, 200);			
	}

	function updateCounters(){
		var counters = [0,0,0,0,0,0,0,0];
		for (s in shapes) {
			var i = 7 - (shapes[s].attrs.cy - 25) / 75;
			counters[i] += shapes[s].units;
		}
		for (var i = 0; i < 8; i++) {
			counter.updateVal(i, counters[i]);
		}
	}

	function initGraph(semesters) {
		var lineattr = {
			stroke: "#555",
			"stroke-dasharray": ". "
		};
		var remove = r.circle(650, 25, 20).attr({
			fill: '#555',
			"fill-opacity": .3,
			"stroke-width": 0,
			opacity: 0
		});
		var removelab = r.text(650, 25, 'X').attr({
			stroke: "none",
			fill: "#000",
			opacity: 0
		}).toFront();
		var removetxt = r.text(650, 25 + 40, 'Drag here to remove').attr({
			stroke: "none",
			fill: "#fff"
		});
		var removetoo = r.path(getTooltipPath(removetxt, 'bottom', 1)).attr({
			fill: '#000'
		});
		removetxt.hide();
		removetoo.hide();
		remove.id = 'del';
		remove.label = removelab;
		remove.text = removetxt;
		remove.tooltip = removetoo;
		
		r.path('M,0,137.5,L,700,137.5').attr(lineattr);		
		r.path('M,0,287.5,L,700,287.5').attr(lineattr);
		r.path('M,0,437.5,L,700,437.5').attr(lineattr);

		semesters.forEach(function (semester, i) {
			var y = ((7 - i) * 75) + 25;
			semester.forEach(function (child, j) {
				child.x = 700;
				child.y = y;
				var shape = new createShape(child);
				shapes.push(shape);
				labels.push(shape.pair);
				cours.push(shape.id);
			});
		});

		// position courses evenly
		for (var i = 8; i--;) {
			var y = ((7 - i) * 75) + 25;
			position(y);
		}

		$('#coursenum').typeahead({
			local: cours.sort()
		});
	}

	$("#coursenum").keyup(function () {
		findCourse();
	});
	$("#remove").click(function () {
		$("#remove").hide();
		unselectCourse();
		$('#coursenum').typeahead('setQuery', '');
	});
	$(".color").click(function () {
		selectColor($(this).css("background-color"));
	});
	$("#more").click(showHidePlaceholders);
	$("body").click(function (e) {
		if (e.target.className == "" || e.target.className == "main-content") {
			unselectCourse();
		}
	});
	var r = Raphael("holder", 720, 580),
		cours = [],
		shapes = [],
		labels = [],
		connections = [];
	initGraph(semesters);
	updateCounters();
}

Raphael.fn.connect = function (obj1, obj2, line) {
	if (obj1.line && obj1.from && obj1.to) {
		line = obj1;
		obj1 = line.from;
		obj2 = line.to;
	}
	var x1 = obj1.attrs.cx,
		y1 = obj1.attrs.cy,
		x2 = obj2.attrs.cx,
		y2 = obj2.attrs.cy;
	var p = ["M", x1, y1, "L", x2, y2].join(",");
	var p1 = Raphael.pathIntersection(getCircletoPath(x1, y1, 20), p)[0];
	var p2 = Raphael.pathIntersection(getCircletoPath(x2, y2, 20), p)[0];
	var c = 6;
	var path = ["M", p1.x, p1.y, "C", p2.x - (p2.x - p1.x) / c, p1.y + (p2.y - p1.y) / c, p1.x + (p2.x - p1.x) / c, p2.y - (p2.y - p1.y) / c, p2.x, p2.y].join(",");
	var arr = this.arrow(p1.x + (p2.x - p1.x) / c, p2.y - (p2.y - p1.y) / c, p2.x, p2.y, 4);
	if (line && line.line) {
		line.bg && line.bg.attr({
			path: path
		});
		line.line.attr({
			path: path
		});
		line.arrow.remove();
		line.arrow = this.path(arr.path).attr({
			stroke: line.line.attrs.stroke,
			fill: line.line.attrs.stroke
		}).rotate((90 + arr.angle), p2.x, p2.y);
	} else {
		return {
			line: this.path(path).attr({
				stroke: "#333",
				"stroke-width": 1.5,
				opacity: .6
			}),
			arrow: this.path(arr.path).attr({
				stroke: "#333",
				fill: "#333"
			}).rotate((90 + arr.angle), p2.x, p2.y),
			from: obj1,
			to: obj2
		}
	}
}

Raphael.fn.reconnect = function (line, object, x, y) {
	var from = line.from.id == object.id;
	var to = line.to.id == object.id;
	if (from || to) {
		if (from) {
			var x1 = x,
				y1 = y,
				x2 = line.to.attrs.cx,
				y2 = line.to.attrs.cy;
		} else {
			var x1 = line.from.attrs.cx,
				y1 = line.from.attrs.cy,
				x2 = x,
				y2 = y;
		}
		var p = ["M", x1, y1, "L", x2, y2].join(",");
		var p1 = Raphael.pathIntersection(getCircletoPath(x1, y1, 20), p)[0];
		var p2 = Raphael.pathIntersection(getCircletoPath(x2, y2, 20), p)[0];
		var c = 6;
		var path = ["M", p1.x, p1.y, "C", p2.x - (p2.x - p1.x) / c, p1.y + (p2.y - p1.y) / c, p1.x + (p2.x - p1.x) / c, p2.y - (p2.y - p1.y) / c, p2.x, p2.y].join(",");
		var arr = this.arrow(p1.x + (p2.x - p1.x) / c, p2.y - (p2.y - p1.y) / c, p2.x, p2.y, 4);
		line.bg && line.bg.animate({
			path: path
		}, 100);
		line.line.animate({
			path: path
		}, 100);
		line.arrow.remove();
		line.arrow = this.path(arr.path).attr({
			stroke: line.line.attrs.stroke,
			fill: line.line.attrs.stroke
		}).rotate((90 + arr.angle), p2.x, p2.y);
	}
}



function getCircletoPath(x, y, r) {
	return ["M", x, (y - r), "A", r, r, 0, 1, 1, (x - 0.1), (y - r), "z"].join(",");
}

Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
	var angle = Math.atan2(x1 - x2, y2 - y1);
	angle = (angle / (2 * Math.PI)) * 360;
	var path = ["M", x2, y2, "L", (x2 - size - 6), (y2 - size), "L", (x2 - size - 6), (y2 + size), "L", x2, y2].join(",");
	return {
		path: path,
		angle: angle
	};
}

Raphael.el.tooltip = function (text) {
	var shape = this;
	if (this.type == 'text') {
		shape = this.pair;
	}
	shape.tooltitle = shape.paper.text(0, 0, text).attr({
		stroke: "none",
		fill: "#fff"
	});
	shape.tooltip = shape.paper.path(getTooltipPath(shape.tooltitle, 'right', 1)).attr({
		fill: '#000'
	});
	shape.tooltitle.hide();
	shape.tooltip.hide();
	this.hover(function (event) {
		if (shape.clicked) return;
		var direction = 'right';
		var position = shape.attr('cx') + 33 + shape.tooltitle.getBBox().width / 2;
		if (position > 590) {
			direction = 'left';
			position = shape.attr('cx') - 33 - shape.tooltitle.getBBox().width / 2;
		}
		shape.tooltitle.attr({
			x: position,
			y: shape.attr('cy')
		});
		shape.tooltip.attr({
			path: getTooltipPath(shape.tooltitle, direction, 1)
		}).show().toFront();
		shape.tooltitle.show().toFront();
	}, function (event) {
		if (shape.tooltitle) {
			shape.tooltitle.hide();
			shape.tooltip.hide();
		}
	});
}

function getTooltipPath(label, direction, position) {
	var tokenRegex = /\{([^\}]+)\}/g,
		objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,
		replacer = function (all, key, obj) {
			var res = obj;
			key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
				name = name || quotedName;
				if (res) {
					if (name in res) {
						res = res[name];
					}
					typeof res == "function" && isFunc && (res = res());
				}
			});
			res = (res == null || res == obj ? all : res) + "";
			return res;
		},
		fill = function (str, obj) {
			return String(str).replace(tokenRegex, function (all, key) {
				return replacer(all, key, obj);
			});
		};
	var r = 5,
		bb = label.getBBox(),
		w = Math.round(bb.width),
		h = Math.round(bb.height),
		x = Math.round(bb.x) - r,
		y = Math.round(bb.y) - r,
		gap = Math.min(h / 2, w / 2, 10),
		shapes = {
			top: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			bottom: "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			right: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
			left: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
		},
		mask = [{
			x: x + r,
			y: y,
			w: w,
			w4: w / 4,
			h4: h / 4,
			right: 0,
			left: w - gap * 2,
			bottom: 0,
			top: h - gap * 2,
			r: r,
			h: h,
			gap: gap
		}, {
			x: x + r,
			y: y,
			w: w,
			w4: w / 4,
			h4: h / 4,
			left: w / 2 - gap,
			right: w / 2 - gap,
			top: h / 2 - gap,
			bottom: h / 2 - gap,
			r: r,
			h: h,
			gap: gap
		}, {
			x: x + r,
			y: y,
			w: w,
			w4: w / 4,
			h4: h / 4,
			left: 0,
			right: w - gap * 2,
			top: 0,
			bottom: h - gap * 2,
			r: r,
			h: h,
			gap: gap
		}];
	return fill(shapes[direction], mask[position]);
}

function hex2rgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  return result ? {        
    r: parseInt(hex.length <= 4 ? result[4]+result[4] : result[1], 16),
    g: parseInt(hex.length <= 4 ? result[5]+result[5] : result[2], 16),
    b: parseInt(hex.length <= 4 ? result[6]+result[6] : result[3], 16),
    toString: function() {
      var arr = [];
      arr.push(this.r);
      arr.push(this.g);
      arr.push(this.b);
      return "rgb(" + arr.join(", ") + ")";
    }
  } : null;
}

function getCourseInformation(number, callback) {
	var appID = 'ba7e7d9f-686a-4408-b9b5-49d40718a5bc';
	var appKey = '19mSVSVhKyROHlpQ_nMOXIC-OzS5ACP9ItbP0R6FaLjma-UdUaiTFxU6';
	var baseURL = 'https://apis.scottylabs.org/v1/schedule/S14/';
	$.get(baseURL + 'courses/' + number + '?app_id=' + appID + '&app_secret_key=' + appKey,
		callback, "json").fail(function () {
		alert("Error");
	})
}