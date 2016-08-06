Chart.defaults.global.defaultFontColor = '#ddd';

var chart_timeline = new Chart(document.getElementById('timeline'), {
	type: 'line',
	data: {datasets: [{data: []}]},
	options: {
		scales: {
			xAxes: [{
				type: 'time',
				display: true,
				time: {
					format: 'YYYY-MM-DD HH:mm',
					tooltipFormat: 'll HH:mm'
				}
			}]
		}
	}
});
var chart_ooss = new Chart(document.getElementById('ooss'), {
	type: 'pie',
	data: {labels: [], datasets: [{data: []}]},
	options: {}
});

var COLORS_SCHEME = [
	'#42A5F5',
	'#26A69A',
	'#9CCC65',
	'#FFEE58',
	'#FFA726',
	'#FF7043',
	'#EC407A',
];
var UPDATE_DELAY_MS = 1000 * 10;

function update () {
	console.log('updating...');
	summary();
	ooss();
	timeline();
	// TODO Add more here
}
update();
setInterval(update, UPDATE_DELAY_MS);

function summary () {
	request('summary', function (data) {
		for (let key in data) {
			$('#' + key).html(data[key]);
		}
		console.log('SUMMARY', data);
	});
}

function ooss () {
	request('drilldown/os', function (data) {
		var labels = [], values = [];
		for (var key in data) {
			labels.push(key);
			values.push(data[key]);
		}
		chart_ooss.data.labels = labels;
		chart_ooss.data.datasets[0].data = values;
		chart_ooss.data.datasets[0].backgroundColor = COLORS_SCHEME;
		chart_ooss.update();
	});
}

function timeline () {
	request('timeline/method', function (data) {
		var datasets = {};
		for (let ts in data) {
			for (let key in data[ts]) {
				datasets[key] = datasets[key] || {};
				datasets[key][ts] = data[ts][key];
			}
		}
		chart_timeline.data.datasets = [];
		let index = 0;
		for (let key in datasets) {
			let data = [];
			for (let ts in datasets[key]) {
				data.push({x: moment(ts).format('YYYY-MM-DD HH:mm'), y: datasets[key][ts]});
			}
			data = data.sort(function (a, b) {
				if (a.x < b.x) return -1;
				if (a.x > b.x) return 1;
				return 0;
			});
			chart_timeline.data.datasets.push({
				label: key,
				borderColor: COLORS_SCHEME[index++],
				data: data,
			});
		}
		chart_timeline.update(0);
	});
}

function request (url, callback) {
	var from = moment().utc().subtract(1, 'hour').format('YYYY-MM-DD');
	var to = moment().utc().format('YYYY-MM-DD');
	$.get('/{{ endpoint }}/' + url + '?from=' + from, function (data) {
		return callback(data);
	});
}
