import React, {Component} from 'react';
import {Config} from '../../../constants';
import './PriceTicker.less';

const TICKER = 'https://api.coingecko.com/api/v3/coins/peerplays' +
                '?tickers=false&market_data=true&community_data=false' + 
                '&developer_data=false&sparkline=false';

class PriceTicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      price: null,
      asset: Config.features.currency
    };

    this.initPrice();
  }

  initPrice() {
    const request = new Request(TICKER);
    
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          price: data.market_data.current_price.usd
        });
      });
  }
  
  render() {
    const {price, asset} = this.state;
    return (
      <div className='ticker'>
        <span className='number'>1&nbsp;</span>
        <span className='asset'>{ asset }</span>
        <span className='equals'>&nbsp;=&nbsp;</span>
        <span className='price'>{ price ? price.toFixed(2) : '--' }</span>
        <span className='usd'>&nbsp;USD</span>
      </div>
    );
  }
}

export default PriceTicker;