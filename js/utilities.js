function queryOverpass (opt, callback) {
	if (!opt) { opt = {}; };
	if (!opt.timeout) { opt.timeout = 25; };
	var query = 
		'[out:json]' +
		(opt.date ? '[date:"'+opt.date+'"]' : '') +
		'[timeout:'+opt.timeout+'];'+
		opt.query;
	console.log('QUERYING: '+query);
	$.ajax({
		url: 'https://overpass-api.de/api/interpreter?data='+query,
		success:
		function (response) {
			if(response.remark!=undefined) { throw new Error("Timeout"); };
			callback(response);
		},
		timeout: opt.timeout*1000,
		error:
		function (jqXHR, status, errorThrown) {
			if (status=='timeout') { throw new Error("Timeout"); }
			else if (status=='abort') { throw new Error("Abort"); }
			else { throw new Error("Unknown"); };
		},
	});
}

function table (data) {
	console.log(data);
	var text = '';
	for (i in data.elements) {
		if (data.elements[i].type) {
			text += data.elements[i].type + data.elements[i].id + '</br>';
			for (key in data.elements[i].tags) {
				text += '- ' + key + " = " + data.elements[i].tags[key] + '</br>';
			};
		} else {
			text += 'count</br>';
			for (key in data.elements[i].count) {
				text += '- ' + key + " = " + data.elements[i].count[key] + '</br>';
			};
		}
		text += '</br>';
	};
	$('div#results').append(text);
}

function start() {
	date = new Date($('input#startdate').val());
	area = $('input#area').val();
	tags = $('input#tags').val();
	timeout = $('input#timeout').val();
	load();
}

function load() {
	queryOverpass(
		{date:date.toISOString(),
		query:'area('+area+')->.sA;'+tags+'(area.sA);out count;',
		timeout:timeout},
		add);
}

function next() {
	date.setMonth(date.getMonth()+1);
	var today = new Date();
	if (date<today) {
		load();
	};
}

function add(data) {
	myLineChart.addData([data.elements[0].count.total], date.getMonth()+1+'/'+date.getFullYear());
	next();
}

function setupChart() {
	var ctx = $("#myChart").get(0).getContext("2d");
	var data = {
		labels: [],
		datasets: [
			{
				label: "amenity=drinking_water",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: []
			}
		]
	};
	Chart.defaults.global.scaleBeginAtZero = true;
	myLineChart = new Chart(ctx).Line(data);
	
}

setupChart();