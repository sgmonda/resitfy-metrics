import React from 'react';

export default class Chart extends React.Component {

  constructor (props, context) {
    super(props, context);
    console.log('CHART creation');
    this.state = {
      a: 13
    };
  }

  render () {
    return (
      <div>
        I am a chart
      </div>
    );
  }
}
