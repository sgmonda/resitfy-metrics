import React from 'react';
import Chart from './Chart'

export default class Dashboard extends React.Component {

  constructor (props, context) {
    super(props, context);
    this.state = {
      a: 13
    };
  }

  componentDidMount () {
    this.setState({ a: 43 });
    console.log('MOUNTED');
  }

  onClick (event) {
    this.setState({ a: this.a + 1 });
    console.log('CLICK');
  }

  render () {
    return (
      <div>
        <h2>Example</h2>
        <Chart onClick={this.onClick} />
      </div>
    );
  }
}
