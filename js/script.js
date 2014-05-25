document.addEventListener('DOMContentLoaded', function () {
	Tabletop.init({
		key: "0AhtG6Yl2-hiRdE9KVHEtSkxscnoxTExua3dyNXJZUXc",
		callback: init
	});
});

function core(id, title, units, dependencies, semester, link, description, color) {
	this.id 	= null;
	this.title 	= null;
	this.units 	= null;
	this.dependencies = null;
	this.semester = null;
	this.link 	= null;
	this.description = null;
	this.color 	= null;
}

function elective(id, title, units, area, dependencies, link, description, color) {
	this.id 	= id;
	this.title 	= title;
	this.units 	= units;
	this.area 	= area;
	this.dependencies = dependencies;
	this.link 	= link;
	this.description = description;
	this.color 	= color;
}

function init(result) {
	tooltip();

	var colors = {};
	var cores = [];
	var areas = {};
	var general = [];
	var electives = [];

	result.colors.elements.forEach(function (row) {
		colors[row.area] = row.color;
	});

	result.core.elements.forEach(function (row) {
		if (!row.number) return;
		var c = new core(row.number, row.title, row.units, row.dependencies.split(','), row.semester, row.link, row.description, colors[row.number.slice(0,2)]);
		cores.push(c);
	});
	
	result.electives.elements.forEach(function (row) {
		if (!row.number) return;
		var e = new elective(row.number, row.title, row.units, row.area, row.dependencies.split(','), row.link, row.description, colors[row.area]);
		electives.push(e);
		general.push(row.number);
		if (row.area in areas) {
			areas[row.area].push(row.number);
		} else {
			areas[row.area] = [row.number];
		}
	});

	result.general.elements.forEach(function (row) {
		if (!row.number) return;
		general.push(row.number);
	});

	var graph = new Graph();
	for (a in areas) {
		addElective(a, areas[a], colors[a]);
	}

	$('#selectcourses').append('<div id="top-group">\
		<input class="form-control" type="text" id="general" placeholder="Add other courses...">\
		<button class="btn btn-info" type="button" id="plus"><span class="glyphicon glyphicon-plus"></span></button>\
		</div>');
	
	$('#general').typeahead({ local: general.sort() });
	$('#plus').click(function(){ addGeneralCourse(general, graph, colors['General']) } );
	$('#general').on('keyup', function(e) {
	    if (e.which == 13) {
	    	addGeneralCourse(general, graph, colors);
	    }
	});

    $("li > a").click(function() {
    	var course = $(this)[0].text;
    	var area = $(this).parent().parent().parent()[0].id;
    	for (i in electives[area]) {
    		if (electives[area][i].slice(0,6) == course) {
    			course = electives[area][i];
    		}
    	}
    	graph.addCourse(course, area, colors[area]);
	});
}

function addElective(name, list, color) {
	var content = '<div class="btn-group" id="'+name+'">\
			<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" style="background-color:'+color+'; border: 1px solid '+color+';">'+name+' &nbsp;&nbsp;<span class="caret"></span></button>\
			<ul class="dropdown-menu pull-right">';
	for (i in list){
		var number = list[i].slice(0,6);
		content += '<li><a>'+number+'</a></li>';
	}
	content += '</ul></div>';
	content += '<button class="btn btn-info btn-group" type="button" id="btn'+name+'" style="background-color:'+color+'; border: 1px solid '+color+';">'+name+'</button>';
	$('#selectcourses').append(content);
	$("#btn"+name).hide();
	$("#btn"+name).tooltip({placement: 'left', title: 'Highlight ' + name + ' course'});
	var label = 'Add ';
	if (name[0] == 'A') { label += 'an ' + name + ' course'} else { label += 'a ' + name + ' course'}
	$("#" + name).tooltip({placement: 'left', title: label});
}

function addGeneralCourse(general, graph, color){
	var course = $('#general').val();
	var re = /([0-9][0-9]-[0-9][0-9][0-9])/;
	var match = course.match(re);
	if (general.indexOf(course) != -1 || match && match[0] == course) {
		graph.addCourse(course, 'general', color);
		$('#general').val('');
		$('#general').typeahead('setQuery', '');
	}
}

function showElectives(){
	if ($("#selectcourses").is(":visible")){
		$("#btnelectives")[0].innerHTML = 'Add Electives';
		$("#selectcourses").fadeOut();
		$("#highlightcourses").fadeOut();
		$("#description").animate({width: "30em"}, 500);
	} else {
		$("#btnelectives")[0].innerHTML = 'Hide Electives';
		$("#selectcourses").fadeIn();
		$("#highlightcourses").fadeIn();
		$("#description").animate({width: "23em"}, 500);
	}
}

function tooltip(){
	$("#remove").hide();
	$("#link").hide();
    $("#error").hide();
    $("#selectcourses").hide();
	$("#highlightcourses").hide();
	$("#link").tooltip({placement: 'right', title: 'View course page'});
	$("#coursenum").tooltip({placement: 'left', title: 'E.g. 15-112 15-221'});
	$("#btncs").tooltip({placement: 'left', title: 'Highlight CS courses'});
	$("#btnmath").tooltip({placement: 'left', title: 'Highlight Mathematics courses'});
	$("#btnelectives").click(showElectives);
}