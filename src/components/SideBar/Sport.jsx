import React, { Component } from 'react';
import './Sport.less';

class Sport extends Component {
  render() {
    return (
      <div className='sport-node-container'
        key={ this.props.id }
        onClick={ this.props.onClick  } >
        { this.props.data.isSelected ?
          <div className='sport-label-container-selected'>
            <label> { this.props.name } </label>
          </div>
          :
          <div className='sport-label-container'>
            <label> { this.props.name } </label>
          </div>
         }
      </div>
    );
  }
}

export default Sport;