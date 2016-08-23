/*global Chart, moment*/

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
					tooltipFormat: 'll HH:mm',
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
			}],
		},
	},
});
var chart_ooss = new Chart(document.getElementById('ooss'), {
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
