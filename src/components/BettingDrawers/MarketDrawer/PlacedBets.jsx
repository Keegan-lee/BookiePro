import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { I18n, Translate } from 'react-redux-i18n';
import ReactDOM from 'react-dom';
import { Button } from 'antd';
import Ps from 'perfect-scrollbar';
import { MarketDrawerActions, NavigateActions } from '../../../actions';
import UnmatchedBets from './UnmatchedBets';
import MatchedBets from './MatchedBets';
import './PlacedBets.less';

class PlacedBets extends PureComponent {
  componentDidMount() {
    Ps.initialize(ReactDOM.findDOMNode(this.refs.placedBets));
  }

  componentDidUpdate() {
    Ps.update(ReactDOM.findDOMNode(this.refs.placedBets));
  }

  // TODO We only need this when the user refresh the browser in web mode
  //      However, this should not happen in the actual desktop app
  componentWillMount() {
    // Extract the current Betting Market Group Id the user is viewing
    // This is required to filter the data from all ongoing bets
    // TODO REVIEW feel free to replace this with a better method!
    const bettingMarketGroupId = window.location.href.split('/').pop();
    this.props.getPlacedBets(bettingMarketGroupId);
  }

  render() {
    return (
      <div className='placed-bets'>
        <div className='content' ref='placedBets'>
          { !this.props.isEmpty &&
            <div>
              <UnmatchedBets/>
              <MatchedBets/>
            </div>
          }
          { this.props.isEmpty &&
            <div className='empty'>
              <div className='instructions'>
                <Translate value='market_drawer.unconfirmed_bets.empty.instructions' dangerousHTML/>
              </div>
              <div className='my-bet-button'>
                <Button onClick={ () => this.props.navigateTo('/my-wager/') }>
                  { I18n.t('market_drawer.unconfirmed_bets.empty.my_bet_button') }
                </Button>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const unmatchedBets = state.getIn(['marketDrawer', 'unmatchedBets']);
  const matchedBets = state.getIn(['marketDrawer', 'matchedBets']);
  return {
    isEmpty: unmatchedBets.isEmpty() && matchedBets.isEmpty()
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    navigateTo: NavigateActions.navigateTo,
    getPlacedBets: MarketDrawerActions.getPlacedBets,
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlacedBets);
