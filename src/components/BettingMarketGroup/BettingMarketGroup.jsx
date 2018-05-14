import React, { PureComponent } from 'react';
import { BettingMarketGroupBanner } from '../Banners';
import { ComplexBettingWidget } from '../BettingWidgets/';
import _ from 'lodash';
import { BettingMarketGroupPageSelector, MarketDrawerSelector, MyAccountPageSelector } from '../../selectors';
import { BettingMarketGroupPageActions, MarketDrawerActions, NavigateActions } from '../../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PeerPlaysLogo from '../PeerPlaysLogo';
import $ from 'jquery';

class BettingMarketGroup extends PureComponent {
  componentDidMount() {
    $('html body').css('min-width', '1210px');
    $('html body').css('overflow', 'overlay');
  }

  componentWillUnmount() {
    $('html body').css('min-width', '1002px');
  }

  componentWillMount() {
    // Get the data
    this.props.getData(this.props.params.objectId);
  }

  componentWillReceiveProps(nextProps){
    if (!nextProps.bettingMarketGroup || nextProps.bettingMarketGroup.isEmpty() || nextProps.eventStatus === "null") {
      // Betting market group doesn't exist,
      // Go back to home page
      this.props.navigateTo('/exchange');
    } else {
      const prevBettingMarketGroupId = this.props.params.objectId;
      const nextBettingMarketGroupId = nextProps.params.objectId;
      if (nextBettingMarketGroupId !== prevBettingMarketGroupId){
        // Get the data
        this.props.getData(nextBettingMarketGroupId);
      }
    }

  }

  render() {
    const { bettingMarketGroup } = this.props;
    // Return nothing if betting market group doesn't exist
    if (!bettingMarketGroup || bettingMarketGroup.isEmpty()) {
      return null;
    } else {
      return (
        <div className='betting-market-group-wrapper'>
          <BettingMarketGroupBanner
            eventName={ this.props.eventName }
            eventTime={ this.props.eventTime }
            isLiveMarket={ this.props.isLiveMarket }
            eventStatus={ this.props.eventStatus[0] }
            eventStatusClassName={ this.props.eventStatus[1] }            
          />
          <ComplexBettingWidget
            bettingMarketGroupStatus={ this.props.bettingMarketGroupStatus[0] }
            eventStatus={ this.props.eventStatus[0] }
            bettingMarketGroupStatusClassName={ this.props.bettingMarketGroupStatus[1] }
            isLiveMarket={ this.props.isLiveMarket }
            marketData={ this.props.marketData }
            totalMatchedBetsAmount={ this.props.totalMatchedBetsAmount }
            createBet={ this.props.createBet }
            unconfirmedBets={ this.props.unconfirmedBets }
            currencyFormat={ this.props.currencyFormat }
            oddsFormat={ this.props.oddsFormat }
            loadingStatus={ this.props.loadingStatus }
            widgetTitle={ this.props.widgetTitle }
            rules={ this.props.rules }
            canCreateBet={ this.props.canCreateBet }
          />
          <div className='margin-top-18'>
            <PeerPlaysLogo />
          </div>
        </div>
      )
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getData: BettingMarketGroupPageActions.getData,
    createBet: MarketDrawerActions.createBet,
    getPlacedBets: MarketDrawerActions.getPlacedBets,
    navigateTo: NavigateActions.navigateTo,
  }, dispatch);
}

const mapStateToProps = (state, ownProps) => {
  const bettingMarketGroup = BettingMarketGroupPageSelector.getBettingMarketGroup(state, ownProps);

  let props = {
    bettingMarketGroup,
    oddsFormat: MyAccountPageSelector.oddsFormatSelector(state)
  }

  // Populate other properties if betting market group exists
  if (bettingMarketGroup && !bettingMarketGroup.isEmpty()) {
    _.assign(props, {
      marketData: BettingMarketGroupPageSelector.getMarketData(state, ownProps),
      eventName: BettingMarketGroupPageSelector.getEventName(state, ownProps),
      eventTime: BettingMarketGroupPageSelector.getEventTime(state, ownProps),
      isLiveMarket: BettingMarketGroupPageSelector.getIsLiveMarket(state, ownProps),
      eventStatus: BettingMarketGroupPageSelector.getEventStatus(state, ownProps),
      bettingMarketGroupStatus: BettingMarketGroupPageSelector.getBettingMarketGroupStatus(state, ownProps),
      totalMatchedBetsAmount: BettingMarketGroupPageSelector.getTotalMatchedBetsAmount(state, ownProps),
      unconfirmedBets: BettingMarketGroupPageSelector.getUnconfirmedBets(state, ownProps),
      loadingStatus: BettingMarketGroupPageSelector.getLoadingStatus(state, ownProps),
      widgetTitle: BettingMarketGroupPageSelector.getWidgetTitle(state, ownProps),
      rules: BettingMarketGroupPageSelector.getRules(state, ownProps),
      canCreateBet: MarketDrawerSelector.canAcceptBet(state, ownProps),
    })
  }
  return props;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BettingMarketGroup);
