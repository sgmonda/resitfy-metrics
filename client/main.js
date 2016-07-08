var chartOOSS = null;
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function () {
  chartOOSS = new google.visualization.PieChart(document.getElementById('ooss'));
  setInterval(update, UPDATE_DELAY_MS);
});

var PIE_OPTIONS = {
  legend: 'none',
  pieSliceText: 'label',
  pieStartAngle: 100,
  width: '100%',
  height: '100%',
  backgroundColor: {
    fill:'transparent'
  },
  chartArea: {
    width: 300,
    height: 300,
  },
  colors: COLORS_SCHEME,
};

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
  ooss();
}

function ooss () {
  request('drilldown/os', function (data) {
    var parsed = [['Label', 'Value']];
    for (var key in data) {
      parsed.push([key, data[key]]);
    }
    data = google.visualization.arrayToDataTable(parsed);
    chartOOSS.draw(data, PIE_OPTIONS);
  });
}

function request (url, callback) {
  var from = moment().utc().subtract(1, 'day').format('YYYY-MM-DD');
  var to = moment().utc().add(1, 'day').format('YYYY-MM-DD');
  $.get('/{{ endpoint }}/' + url + '?from=' + from, function (data) {
    console.log('RESULT', data);
    return callback(data);
  });
}
