/*global Chart, moment*/

Chart.defaults.global.defaultFontColor = '#ddd';
Chart.defaults.global.animation = {
	duration: 1000,
	easing: 'linear',
};

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
					tooltipFormat: 'll HH:mm',
				},
				gridLines: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			}],
			yAxes: [{
				id: 'right',
				position: 'right',
				display: true,
				ticks: {
					callback: (num) => {
						let units = {min: 60 * 1000, s: 1000};
						for (let key in units) {
							if (num >= units[key]) return (num / units[key]).toFixed(2) + ' ' + key;
						}
						return num.toFixed(2) + ' ms';
					},
				},
				gridLines: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			}, {
				id: 'left',
				position: 'left',
				display: true,
				ticks: {
					callback: (num) => {
						let units = {'KB': 1024, 'MB': 1024 * 1024};
						for (let key in units) {
							if (num >= units[key]) return parseInt(num / units[key]) + ' ' + key;
						}
						return num + ' B';
					},
				},
				gridLines: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			}],
		},
	},
});
var chart_ooss = new Chart(document.getElementById('ooss'), {
	type: 'pie',
	data: {labels: [], datasets: [{data: []}]},
	options: {},
});
var chart_hostname = new Chart(document.getElementById('hostname'), {
	type: 'pie',
	data: {labels: [], datasets: [{data: []}]},
	options: {},
});
var chart_method = new Chart(document.getElementById('method'), {
	type: 'pie',
	data: {labels: [], datasets: [{data: []}]},
	options: {},
});
var chart_route = new Chart(document.getElementById('route'), {
	type: 'pie',
	data: {labels: [], datasets: [{data: []}]},
	options: {},
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
var UPDATE_DELAY_MS = 1000 * 1;

function update () {
	console.log('updating...');
	summary();
	ooss();
	hostname();
	method();
	route();
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

function method () {
	request('drilldown/method', function (data) {
		var labels = [], values = [];
		for (var key in data) {
			labels.push(key);
			values.push(data[key]);
		}
		chart_method.data.labels = labels;
		chart_method.data.datasets[0].data = values;
		chart_method.data.datasets[0].backgroundColor = COLORS_SCHEME;
		chart_method.update();
	});
}

function route () {
	request('drilldown/route', function (data) {
		var labels = [], values = [];
		for (var key in data) {
			labels.push(key);
			values.push(data[key]);
		}
		chart_route.data.labels = labels;
		chart_route.data.datasets[0].data = values;
		chart_route.data.datasets[0].backgroundColor = COLORS_SCHEME;
		chart_route.update();
	});
}

function hostname () {
	request('drilldown/hostname', function (data) {
		var labels = [], values = [];
		for (var key in data) {
			labels.push(key);
			values.push(data[key]);
		}
		chart_hostname.data.labels = labels;
		chart_hostname.data.datasets[0].data = values;
		chart_hostname.data.datasets[0].backgroundColor = COLORS_SCHEME;
		chart_hostname.update();
	});
}

function timeline () {
	request('timeline/duration,response_length?metrics=avg', function (raw) {
		var datasets = {};
		chart_timeline.data.datasets = [];
		for (let variable in raw) {
			let data = raw[variable];
			for (let ts in data) {
				for (let key in data[ts]) {
					datasets[variable + '_' + key] = datasets[variable + '_' + key] || {};
					datasets[variable + '_' + key][ts] = data[ts][key];
				}
			}
		}
		let index = 0;
		for (let key in datasets) {
			let yAxisID = key.indexOf('duration') === 0 ? 'right' : 'left';
			let data = [];
			for (let ts in datasets[key]) {
				data.push({
					x: moment(ts).format('YYYY-MM-DD HH:mm'),
					y: datasets[key][ts].toFixed(2).replace('.00', ''),
				});
			}
			data = data.sort(function (a, b) {
				if (a.x < b.x) return -1;
				if (a.x > b.x) return 1;
				return 0;
			});
			chart_timeline.data.datasets.push({
				label: key.replace(/_/g, ' ').replace(/\s[^\s]+$/, ''),
				borderColor: COLORS_SCHEME[index++ % COLORS_SCHEME.length],
				data: data,
				yAxisID: yAxisID,
			});
		}
		chart_timeline.update(0);
	});
}

function request (url, callback) {
	var from = moment().utc().subtract(1, 'hour').format('YYYY-MM-DD');
	var to = moment().utc().format('YYYY-MM-DD');
	let joinSymbol = '?';
	if (url.indexOf('?') !== -1) joinSymbol = '&';
	$.get('/{{ endpoint }}/' + url + joinSymbol + 'from=' + from, function (data) {
		return callback(data);
	});
}
