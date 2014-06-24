$.dbGET = function(action, data, callback) {
	$.get('/course-planner/data.php?action='+action,data,callback,'json');
}

document.addEventListener('DOMContentLoaded', function () {
	
	console.log('***************************************************');
	
	$.dbGET('addUser', {}, function(r) {
		console.log('Add User');
		console.log(r);
		$.dbGET('getUsers', {}, function(r) {
			console.log('Get Users');
			console.log(r);
		});
	});

	// $.dbGET('setUser', {json: 'TEST'}, function(r) {
	// 	console.log('Set User');
	// 	$.dbGET('getUser', {}, function(r) {
	// 		console.log('Get User');
	// 		console.log(r);
	// 	});
	// });

	$("#remove").hide();
	$("#buttons").hide();
	$("article").hide();
	if ($(window).width() > 1050) {
		addTooltip();
	}
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
	Tabletop.init({
		key: "0AhtG6Yl2-hiRdE9KVHEtSkxscnoxTExua3dyNXJZUXc",
		callback: init
	});
});

function course(id, title, units, dependencies, link, description, color, area) {
	this.id = id;
	this.title = title;
	this.units = units;
	this.dependencies = dependencies;
	this.link = link;
	this.description = description;
	this.color = color;
	this.area = area;
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
	});
	result.courses.elements.forEach(function (row) {
		if (row.number.length < 2) return;
		if (row.visible == "TRUE") {
			var c = new course(row.number, row.title, row.units, row.dependencies.split(','), row.URL, row.description, colors[row.category], 'core');
			semesters[parseInt(row.semester) - 1].push(c);
		} else {
			var e = new course(row.number, row.title, row.units, row.dependencies.split(','), row.URL, row.description, colors[row.category], row.category);
			electives[row.number] = e;
			if (row.category in areas) {
				areas[row.category].push(row.number);
			} else {
				areas[row.category] = [row.number];
			}
		}
	});
	var graph = new Graph(semesters);
	for (a in areas) {
		addElective(a, areas[a], colors[a]);
	}
	$('#btncs').css({
		"background-color": colors['Core'],
		"border": "1px solid" + colors['Core']
	});
	$('#btnmath').css({
		"background-color": colors['Math'],
		"border": "1px solid" + colors['Math']
	});
	$('#selectcourses').append('<div id="top-group">\
		<input class="form-control" type="text" id="general" placeholder="Add other courses...">\
		<button class="btn btn-info" type="button" id="plus"></button>\
		</div>');
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
	});
}

var tools = {
	"Algorithms": 	"Add an Algorithm and Complexity constrained elective",
	"Applications": "Add an Applications constrained elective",
	"Logics": 		"Add a Logics and Languages constrained elective",
	"Systems": 		"Add a Software Systems constrained elective"
}

function addElective(name, list, color) {
	var content = '<div class="btn-group" id="' + name + '">\
			<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" style="background-color:' + color + '; border: 1px solid ' + color + ';"><span class="caret"></span>&nbsp;&nbsp;' + name + '</button>\
			<ul class="dropdown-menu">';
	for (i in list) {
		var number = list[i].slice(0, 6);
		content += '<li><a>' + number + '</a></li>';
	}
	content += '</ul></div>';
	content += '<button class="btn btn-info" type="button" id="btn' + name + '" style="background-color:' + color + '; border: 1px solid ' + color + ';">' + name + '</button>';
	$('#selectcourses').append(content);
	$("#btn" + name).hide();
	$("#btn" + name).tooltip({
		placement: 'right',
		title: 'Highlight ' + name + ' course'
	});
	$("#" + name).tooltip({
		placement: 'right',
		title: tools[name]
	});
}

function addGeneralCourse(graph, color) {
	var number = $('#general').val();
	var re = /([0-9][0-9]-[0-9][0-9][0-9])/;
	var match = number.match(re);
	if (match && match[0] == number) {
		var g = new course(number, null, 'undefined', [], null, null, color, 'general');
		graph.addCourse(g);
		$('#general').val('');
		$('#general').typeahead('setQuery', '');
	}
}

function showElectives() {
	if ($("#selectcourses").is(":visible")) {
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

function destroyTooltip(){
	$('#coursenum').tooltip('destroy');
	$('#link').tooltip('destroy');
	$('#btncs').tooltip('destroy');
	$('#btnmath').tooltip('destroy');
}

function addTooltip(){
	$("#coursenum").tooltip({
		placement: 'right',
		title: 'Example 15-112 15-221 21-127',
		keyboard: false
	});
	$("#link").tooltip({
		placement: 'right',
		title: 'View course page'
	});
	$("#btncs").tooltip({
		placement: 'right',
		title: 'Highlight CS courses'
	});
	$("#btnmath").tooltip({
		placement: 'right',
		title: 'Highlight Math courses'
	});
}