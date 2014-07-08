document.addEventListener('DOMContentLoaded', function () {
	setUp();

	$.dbGET('getUsername', {}, function(r) {
		if (r) {
			$('#logout div').html("LOGOUT " + r.toUpperCase());
			$('a#logout').css('width', '200px');
		}
	});

	Tabletop.init({
		key: "0AhtG6Yl2-hiRdE9KVHEtSkxscnoxTExua3dyNXJZUXc",
		callback: init
	});
});

function course(id, title, units, dependencies, link, description, color, area, faded) {
	this.id = id;
	this.title = title;
	this.units = units;
	this.dependencies = dependencies;
	this.link = link;
	this.description = description;
	this.color = color;
	this.area = area;
	this.faded = faded;
}

function init(result) {
	var colors = {};
	var areas = {};
	var electives = {};
	var semesters = [
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	];
	result.colors.elements.forEach(function (row) {
		colors[row.category] = row.color;
		addColorBtn(row.category, row.color);
	});
	result.courses.elements.forEach(function (row) {
		if (row.number.length < 2) return;
		if (row.visible == "TRUE") {
			var c = new course(row.number, row.title, row.units, row.dependencies.split(','), row.URL, row.description, colors[row.category], 'core', row.faded == "TRUE" ? true : false);
			semesters[parseInt(row.semester) - 1].push(c);
		} else {
			var e = new course(row.number, row.title, row.units, row.dependencies.split(','), row.URL, row.description, colors[row.category], row.category, row.faded == "TRUE" ? true : false);
			electives[row.number] = e;
			if (row.category in areas) {
				areas[row.category].push(row.number);
			} else {
				areas[row.category] = [row.number];
			}
		}
	});

	var graph = new Graph(semesters);

	// USER DATA
	$.dbGET('getUser', {}, function(r) {
		if (r.length == 0) {
			$.dbGET('addUser');
			return;
		}
		var content = JSON.parse(r[0].json);
		for (c in content){
			// adding non-core courses
			if (content[c].area != 'core'){
				if (c in electives) {
					graph.addCourse(electives[c]);
				} else {
					var g = new course(c, null, 'undefined', [], null, null, colors['General'], 'general');
					graph.addCourse(g);
				}
			}
			// updating position
			if (content[c].cx) {
				graph.repositionCourse(c, content[c].cx, content[c].cy);
			}
		}
	});

	for (a in areas) {
		addElective(a, areas[a], colors[a]);
	}

	$('#general').typeahead({
		local: Object.keys(electives).sort()
	});
	$('#plus').click(function () {
		addGeneralCourse(graph, colors['General']);
	});
	$('#general').on('keyup', function (e) {
		if (e.which == 13) {
			addGeneralCourse(graph, colors['General']);
		}
	});
	$("li > a").click(function () {
		var c = $(this)[0].text;
		graph.addCourse(electives[c]);
		$.dbGET('setUser', { json: JSON.stringify(graph.getContent()) });
	});
	if ($(window).width() > 1050) {
		addTooltip();
	} else {
		destroyTooltip();
	}
}

var tools = {
	"Algorithms": 	"Add an Algorithm and Complexity constrained elective",
	"Applications": "Add an Applications constrained elective",
	"Logics": 		"Add a Logics and Languages constrained elective",
	"Systems": 		"Add a Software Systems constrained elective"
}

function addElective(name, list, color) {
	var content = '<div class="btn-group" id="' + name + '" title="' + tools[name] + '">\
			<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" style="background-color:' + color + '; border: 1px solid ' + color + ';">\
			<span class="caret"></span>&nbsp;&nbsp;' + name + '</button><ul class="dropdown-menu">';
	for (i in list) {
		var number = list[i].slice(0, 6);
		content += '<li><a>' + number + '</a></li>';
	}
	content += '</ul></div>';
	$('#select').append(content);
}

function addColorBtn(name, color){
	var content = '<button class="btn color" type="button" id="btn' + name + '" style="background-color:' + color + ';" title="Highlight ' + name + ' courses"></button>';
	$('#highlight').append(content);
}

function addGeneralCourse(graph, color) {
	var number = $('#general').val();
	var re = /([0-9][0-9]-[0-9][0-9][0-9])/;
	var match = number.match(re);
	if (match && match[0] == number) {
		var g = new course(number, null, 'undefined', [], null, null, color, 'general');
		graph.addCourse(g);
		$.dbGET('setUser', { json: JSON.stringify(graph.getContent()) });
		$('#general').val('');
		$('#general').typeahead('setQuery', '');
	}
}

function showElectives() {
	if ($("#select").is(":visible")) {
		$("#btnelectives")[0].innerHTML = 'Add Electives';
		$("#buttons").hide();
		if ($("#title").html() != '') {
			$("article").fadeIn();
		}
	} else {
		$("#btnelectives")[0].innerHTML = 'Hide Electives';
		$("article").hide();
		$("#buttons").fadeIn();
	}
}

function setUp(){
	$("#logout div").click(function () {
		if (this.innerHTML != "LOGIN") {
			window.location.href = 'logout';
		} else {
			location.reload();
		}
	});
	$("#remove").hide();
	$("#buttons").hide();
	$("article").hide();
	$("#btnelectives").click(showElectives);
	$("[data-toggle]").click(function () {
		var toggle_el = $(this).data("toggle");
		$(toggle_el).toggleClass("open-sidebar");
	});
	$(".swipe-area").swipe({
		swipeStatus: function (event, phase, direction, distance, duration, fingers) {
			if (phase == "move" && direction == "right") {
				$(".container").addClass("open-sidebar");
				return false;
			}
			if (phase == "move" && direction == "left") {
				$(".container").removeClass("open-sidebar");
				return false;
			}
		}
	});
	$(window).resize(function () {
		if ($(window).width() < 1050) {
			destroyTooltip();
		} else {
			addTooltip();
		}
	});
}

function addTooltip(){
	$("#coursenum").tooltip({ placement: 'right', keyboard: false });
	$("#link").tooltip({placement: 'right'});
	$(".color").tooltip({placement: 'right'});
	$("#select .btn-group").tooltip({placement: 'right'});
	if ($("#logout div")[0].innerHTML == "LOGIN") {
		$("#logout").tooltip({placement: 'right'});
	}
}

function destroyTooltip(){
	$("#coursenum").tooltip('destroy');
	$("#logout").tooltip('destroy');
	$("#link").tooltip('destroy');
	$(".color").tooltip('destroy');
	$("#select .btn-group").tooltip('destroy');
}