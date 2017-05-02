import React, { Component } from 'react';
import moment from 'moment';
import { I18n } from 'react-redux-i18n';

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: moment()
    }
  }

  componentDidMount() {
    this.timer = setInterval(
      () => this.tick(),
      1000
    )
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    this.setState({
      time: moment()
    });
  }

  render() {
    return (
      <div { ...this.props } >
        { I18n.t('titleBar.clock', { time: this.state.time.format('HH:mm') }) }
      </div>
    );
  }

}

export default Clock;
