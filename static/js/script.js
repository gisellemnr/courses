var USER = null;

document.addEventListener('DOMContentLoaded', function () {
	setUp();

	$.usrGET('getUsername', {}, function(r) {
		if (r) {
			USER = r;
			$('#log div').html("LOGOUT " + USER.toUpperCase());
			$('a#log').css('width', '200px');
			// $.dbGET('initDatabase');
			$("#share").show();
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
	this.units = parseInt(units);
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
	var labels = ['F1', 'S1', 'F2', 'S2', 'F3', 'S3', 'F4', 'S4'];
	var advisors = [];
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
	var legends = {};
	result.colors.elements.forEach(function (row) {
		colors[row.category] = row.color;
		legends[row.category] = row.legend;
		addColorBtn(row.category, row.legend, row.color);
	});
	result.courses.elements.forEach(function (row) {
		if (row.number.length < 2) return;
		if (row.visible == "TRUE") {
			var c = new course(row.number, row.title, row.units, row.dependencies.split(','), row.URL, row.description, colors[row.category], 'core');
			semesters[labels.indexOf(row.semester)].push(c);
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
	result.placeholders.elements.forEach(function (row) {
		var c = new course(row.number, row.title, 0, [], row.URL, row.description, colors[row.category], 'placeholder');
		semesters[labels.indexOf(row.semester)].push(c);
	});
	result.advisors.elements.forEach(function (row) {
		addAdvisor(row.andrewid, row.name);
		advisors.push(row.andrewid);
	});

	var graph = new Graph(semesters, parseInt(result.parameters.elements[0].value));

	// USER DATA
	if (USER) {
		$.dbGET('getUser', {}, function(r) {
			if (r.length == 0) {
				$.dbGET('addUser');
				return;
			}
			var content = JSON.parse(r[0].json);
			for (c in content){
				// adding non-core courses
				if (content[c].area != 'core' && content[c].area != 'placeholder'){
					if (c in electives) {
						graph.addCourse(electives[c], true);
					} else {
						var g = new course(c, 'not found', 0, [], null, null, colors['General'], 'general');
						graph.addCourse(g, true);
					}
				}
				graph.reposition(c, content[c].cx, content[c].cy);
			}
			var advisor = r[0].advisor;
			$("#" + advisor).click();
		});
		if (advisors.indexOf(USER) > -1) {
			$('#students').show();
			$.dbGET('getAdvisees', { advisor: USER }, function(r) {
				for (i in r) {
					console.log(r[i].user);
					$('#students .dropdown-menu').append('<li><a>' + r[i].user + '</a></li>');
					$('#students > .dropdown-menu').append('<li><a>' + r[i].user + '</a></li>');
					$('#students .dropdown-menu').append('<li><a>HELLO</a></li>');
				}
			});
		}
	}

	for (a in areas) {
		addElective(a, areas[a], colors[a], legends[a]);
	}

	$('#general').typeahead({
		local: Object.keys(electives).sort()
	});
	$('#plus').click(function () {
		addGeneralCourse(graph, colors, electives);
	});
	$('#general').on('keyup', function (e) {
		if (e.which == 13) {
			addGeneralCourse(graph, colors, electives);
		}
	});
	$("li > a").click(function () {
		var c = $(this)[0].text;
		graph.addCourse(electives[c]);
		if (USER) {
			$.dbGET('setUser', { json: JSON.stringify(graph.getContent()) });
		}
	});
	if ($(window).width() > 1050) {
		addTooltip();
	} else {
		destroyTooltip();
	}
	$('.advisor').click(function () {
		var andrew = $(this)[0].id;
		if ($(this).hasClass('checked')) {
			$(this).removeClass('checked');
			$.dbGET('setAdvisor', { advisor: '' });
		} else {
			$(".advisor").removeClass('checked');
			$(this).addClass('checked');
			$.dbGET('setAdvisor', { advisor: andrew });
		}
	});
}

function addElective(name, list, color, label) {
	var content = '<div class="btn-group" id="' + name + '" title="' + label + '">\
			<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" style="background-color:' + color + '; border: 1px solid ' + color + ';">\
			<span class="caret"></span>&nbsp;&nbsp;' + name + '</button><ul class="dropdown-menu">';
	for (i in list) {
		var number = list[i].slice(0, 6);
		content += '<li><a>' + number + '</a></li>';
	}
	content += '</ul></div>';
	$('#select').append(content);
}

function addColorBtn(name, label, color){
	var content = '<button class="btn color" type="button" id="btn' + name + '" style="background-color:' + color + ';" title="Highlight ' + name + ' courses"></button>';
	content += '<label>' + label + '</label>';
	$('#colors').append(content);
}

function addGeneralCourse(graph, colors, electives) {
	var number = $('#general').val();
	if (number.length == 5) {
		number = number.slice(0,2) + "-" + number.slice(2,5);
	}
	var re = /([0-9][0-9]-[0-9][0-9][0-9])/;
	var match = number.match(re);
	if (match && match[0] == number) {
		if (number in electives) {
			graph.addCourse(electives[number]);
		} else {
			var g = new course(number, 'not found', 0, [], null, null, colors['General'], 'general');
			graph.addCourse(g);
		}
		$('#general').val('');
		$('#general').typeahead('setQuery', '');
		if (USER) {
			$.dbGET('setUser', { json: JSON.stringify(graph.getContent()) });
		}
	}
}

function addAdvisor(id, name){
	var content = '<div class="advisor" id="' + id + '"><span class="icon"></span>' + name + '</div>';
	$('#advisors').append(content);
}

function setUp(){
	$("#log div").click(function () {
		if (this.innerHTML == "LOGIN") {
			window.location.href = 'private';
		} else {
			window.location.href = 'https://cs.qatar.cmu.edu/course-planner/private/logout';
		}
	});
	$("#remove").hide();
	$("#link").hide();
	$(".target").hide();
	$("#share").hide();
	$(".menu").click(showHideMenus);
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
	$(".menu").tooltip({placement: 'right'});
	$("#more").tooltip({placement: 'right'});
	$("#select .btn-group").tooltip({placement: 'right'});
	if ($("#log div")[0].innerHTML == "LOGIN") {
		$("#log").tooltip({placement: 'right'});
	}
}

function destroyTooltip(){
	$("#coursenum").tooltip('destroy');
	$("#log").tooltip('destroy');
	$("#link").tooltip('destroy');
	$("#more").tooltip('destroy');
	$(".color").tooltip('destroy');
	$(".menu").tooltip('destroy');
	$("#select .btn-group").tooltip('destroy');
}

function showHideMenus(){
	$(".menu").removeClass('checked');
	$("#counter-legend").hide();
	if ($(this.name).is(":visible")) {
		$(".target").hide();
		$(this).removeClass('checked');
	} else {
		$(".target").hide();
		$("#iframe").css('visibility', 'hidden');
		$(this).addClass('checked');
		$(this.name).fadeIn();
	}
}