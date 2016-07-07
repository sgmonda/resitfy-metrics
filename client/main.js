console.log('SCRIPT READY');

var app = document.getElementById('react-app');
var component = Item({ initialCount: 7 });
React.renderComponent(component, container);
