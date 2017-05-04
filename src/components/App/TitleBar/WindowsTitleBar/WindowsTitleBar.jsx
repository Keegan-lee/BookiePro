import React, { Component } from 'react';
import WindowsControls from './WindowsControls';
import PropTypes from 'prop-types';
import Clock from '../Clock';

class WindowsTitleBar extends Component {

  render() {
    const {
        isConnected,
        isWindowFocused,
        onMaximizeClick,
        onMinimizeClick,
        onRestoreDownClick,
        onCloseClick,
        isMaximized,
         ...props
       } = this.props;

    return (
      <div className='windows-title-bar' { ...props }>
        <div className='left'>
          <i className={ isConnected ? 'connection-status-online' : 'connection-status-offline' } />
          <Clock className='clock' />
        </div>
        <div className='right'>
          <WindowsControls
            isWindowFocused={ isWindowFocused }
            onMaximizeClick={ onMaximizeClick }
            onMinimizeClick={ onMinimizeClick }
            onRestoreDownClick={ onRestoreDownClick }
            onCloseClick={ onCloseClick }
            isMaximized={ isMaximized }
          />
        </div>
      </div>
    )
  }

}

WindowsTitleBar.propTypes = {
  isWindowFocused: PropTypes.bool,
  onMaximizeClick: PropTypes.func,
  onRestoreDownClick: PropTypes.func,
  onMinimizeClick: PropTypes.func,
  onCloseClick: PropTypes.func,
  isMaximized: PropTypes.bool,
  isConnected: PropTypes.bool
};

export default WindowsTitleBar;
