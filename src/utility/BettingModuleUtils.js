import { BetTypes } from '../constants';
import _ from 'lodash';
import Immutable from 'immutable';
import { CurrencyUtils } from './';
const oddsPlaces = 2;
const stakePlaces = 3; //minimum stake = 0.001 BTC
const exposurePlaces = oddsPlaces + stakePlaces;

var isFieldInvalid = function(object, field) {
  if (!object.has(field)) return true;
  const floatValue = parseFloat(object.get(field));
  if (floatValue === 0) return true;

  return isNaN(floatValue);
}

var BettingModuleUtils = {

  //eodds percision (BTC)
  oddsPlaces:oddsPlaces,
  //stake / backers' stake percision (BTC)
  stakePlaces:stakePlaces,
  //exposure / profit / liability percision (BTC)
  exposurePlaces:exposurePlaces,


  //  =========== Bet Calculations ===========

  //Appendix I – Summary of Formulas
  // Stake = Profit / (Odds – 1)
  // Backer's Stake = Liability / (Odds – 1)
  getStake: function(odds, profit, currency = 'BTC') {
    const floatProfit = parseFloat(profit);
    const floatOdds = parseFloat(odds);

    //check invalid input
    if (isNaN(floatProfit) || isNaN(floatOdds) ) {
      return;
    }
    if ( floatOdds.toFixed(oddsPlaces) < 1.01 ){
      return;
    }

    return CurrencyUtils.getFormattedCurrency( floatProfit / ( floatOdds - 1 ) , currency, stakePlaces, false);

  },

  // Profit = Stake * (Odds – 1)
  // Liability = Backer's Stake * (Odds – 1)
  getProfitOrLiability: function(stake, odds, currency = 'BTC') {
    const floatStake = parseFloat(stake);
    const floatOdds = parseFloat(odds);

    //check invalid input
    if (isNaN(floatStake) || isNaN(floatOdds) ) {
      return;
    }
    if ( floatOdds.toFixed(oddsPlaces) < 1.01 ){
      return;
    }

    return CurrencyUtils.getFormattedCurrency( floatStake * ( floatOdds - 1 ) , currency, exposurePlaces, false);

  },

  //Payout = Backer’s Stake * Odds
  getPayout: function(stake, odds, currency = 'BTC') {
    const floatStake = parseFloat(stake);
    const floatOdds = parseFloat(odds);

    //check invalid input
    if (isNaN(floatStake) || isNaN(floatOdds) ) {
      return;
    }
    if ( floatOdds.toFixed(oddsPlaces) < 1.01 ){
      return;
    }

    return CurrencyUtils.getFormattedCurrency( floatStake * floatOdds , currency, exposurePlaces, false);

  },


  //  =========== Exposure ===========

  // Matched Exposure (Pending Change Request)
  // Case    Exposure of the selection that the bet originates from    All other selection’s exposure
  // A back bet is matched    + Profit(BTC)   - Stake(BTC)
  // A lay bet is matched    - Liability(BTC)    + Backer’s Stake(BTC)
  //
  // Betslip Exposure (Pending Change Request)
  // Case    Exposure of the selection that the bet originates from    All other selection’s exposure
  // A full back bet betslip is filled    + Profit(BTC)   - Stake(BTC)
  // A full lay bet betslip is filled    - Liability(BTC)   + Backer’s Stake(BTC)
  //
  // Parameters:
  //  bettingMarketId, String : id of the betting market for which expsoure calculation specified
  //  bets: unconfirmedBets, Immutable.List : marketDrawer.unconfirmedBets stored in redux

  // Returns:
  //  exposure of the target betting market
  getExposure: function(bettingMarketId, bets , currency = 'BTC'){
    let exposure = 0.0

    bets.forEach((bet, i) => {

      // TODO: Confirm if stake should be empty or having having a zero value if it is not available
      // TODO: Confirm if profit/liability should be empty or having a zero value if it is not available
      if ( isFieldInvalid(bet, 'odds') || isFieldInvalid(bet, 'stake') ||
           isFieldInvalid(bet, 'profit') || isFieldInvalid(bet, 'liability') ) {
        return;
      }

      if (bettingMarketId === bet.get('betting_market_id')){

        //Exposure of the selection that the bet originates from
        if ( bet.get('bet_type') === BetTypes.BACK){
          // A full back bet betslip is filled --> + Profit
          exposure += parseFloat( bet.get('profit') );
        } else if ( bet.get('bet_type') === BetTypes.LAY){
          // A full lay bet betslip is filled --> - Liability
          exposure -= parseFloat( bet.get('liability') );
        }
      } else {
        //  All other selection’s exposure
        if ( bet.get('bet_type') === BetTypes.BACK){
          // A full back bet betslip is filled --> - Stake
          exposure -= parseFloat( bet.get('stake') );
        } else if ( bet.get('bet_type') === BetTypes.LAY){
          // A full lay bet betslip is filled --> + Backer’s Stake
          exposure += parseFloat( bet.get('stake') );
        }
      }

    });

    return CurrencyUtils.getFormattedCurrency( exposure , currency, exposurePlaces, false);
  },


  getPotentialExposure: function( marketExposure, betslipExposure){
    return (parseFloat(marketExposure) + parseFloat(betslipExposure)).toFixed(exposurePlaces);
  },

  //  =========== Book Percentage  ===========

  // Back Book Percentage: (100% / Best Back Odds of Selection 1) + … + (100% / Best Back Odds of Selection n)
  // Lay Book Percentage: (100% / Best Lay Odds of Selection 1) + … + (100% / Best Lay Odds of Selection n)

  // Parameters:
  //  bestOfferList : BestBackOddsPerMarket  Immutable.List : the best grouped back odds of each selection
  // Returns:
  //  BackBookPercentage: the back book percentage of the market
  getBookPercentage: function( bestOfferList){

    const backBookPercent = bestOfferList.reduce( (total, offer) => total + ( 100 / offer.get('odds') ) , 0.0);

    return Math.round(backBookPercent);
  },

  //  =========== Betting Drawer =========== CR-036 page 2

  // Total (Betslip) = ∑ Back Bet’s Stake(BTC) & Lay Bet’s Liability(BTC) in the Betslip section
  //
  // Parameters:
  // bets : unconfirmedBets, Immutable.List : marketDrawer.unconfirmedBets stored in redux
  // currency : display currency
  //
  // Returns:
  //  total
  getBetslipTotal: function( bets, currency = 'BTC'){

    const accumulator = (total, bet) => {

      if ( isFieldInvalid(bet, 'odds') || isFieldInvalid(bet, 'stake') ||
           isFieldInvalid(bet, 'profit') || isFieldInvalid(bet, 'liability') ) {
        return total;
      }

      if ( bet.get('bet_type') === BetTypes.BACK){
        // + Back Bet’s Stake(BTC)
        return total + parseFloat( bet.get('stake') );
      } else if ( bet.get('bet_type') === BetTypes.LAY){
        // + Lay Bet’s Liability(BTC)
        return total + parseFloat( bet.get('liability') );
      } else {
        return total;
      }
    }
     // this can be reused many times within the module
    let total = bets.reduce(accumulator, 0.0);

    return CurrencyUtils.getFormattedCurrency( total , currency, exposurePlaces, false);

  },


  //  =========== Average Odds =========== CR-036 page 2

  // Matched Back Bets (Pending Change Request)
  // Grouped Profit = ∑ Profit
  // Grouped Stake = ∑ Stake
  // Average Odds (round to 2 decimal places) = (∑ Stake + ∑ Profit) / ∑ Stake

  //  Matched Lay Bets (Pending Change Request)
  //  Grouped Liability = ∑ Liability
  // Grouped Backer’s Stake = ∑ Backer’s Stake
  // Average Odds (round to 2 decimal places) = (∑ Backer’s Stake + ∑ Liability) / ∑ Backer’s Stake

  // NOTE format below is outdated according to the wiki
  // https://bitbucket.org/ii5/bookie/wiki/blockchain-objects/bet
  // Parameters:
  // matchedBets :  Immutable.List( Array(bets) )
  // bets.js
  // "id": "1.106.2",
  // "bettor_id": "1.2.48",
  // "betting_market_id": "1.105.12",
  // "amount_to_bet": 2150,
  // "amount_to_win": 5290,
  // "back_or_lay": "Lay",
  // "remaining_amount_to_bet": 2150,
  // "remaining_amount_to_win": 5290,
  // "cancelled": falset

  // precision =  precision: state.getIn(['asset', 'assetsById', '1.3.0', 'precision'])

  // Returns:
  //  Immutable.toJS(
  // average Odds,
  //  Grouped Profit
  // Grouped Stake
  //  )


  //     sample : render @ MyWager.jsx(
  // BettingModuleUtils.getAverageOddsFromMatchedBets(this.props.matchedBetsData, 'mBTC', 5 )

  getAverageOddsFromMatchedBets: function( matchedBets, currency = 'BTC', precision = 5){


    // Grouped Profit = ∑ Profit
    // Grouped Stake = ∑ Stake
    //  Grouped Liability = ∑ Liability
    // Grouped Backer’s Stake = ∑ Backer’s Stake
    const accumulator = (result, bet) => {

      const amountToBet = bet.get('amount_to_bet') / Math.pow(10, precision);
      const amountToWin = bet.get('amount_to_win') / Math.pow(10, precision);

      // TODO: may not need toLowerCase once we got the real data
      if ( bet.get('back_or_lay').toLowerCase() === BetTypes.BACK){
        // for back bet, amount to bet is stake, amount to win is profit
        return result.update( 'groupedStake', (groupedStake) => groupedStake + amountToBet )
          .update( 'groupedLiability', (groupedLiability) => groupedLiability + amountToWin )
          .update( 'groupedProfit', (groupedProfit) => groupedProfit + amountToWin )

      } else if ( bet.get('back_or_lay').toLowerCase() === BetTypes.LAY){
        // for lay bet amount to bet is liability, amount to win is backers stake
        return result.update( 'groupedStake', (groupedStake) => groupedStake + amountToWin )
          .update( 'groupedLiability', (groupedLiability) => groupedLiability + amountToBet )
          .update( 'groupedProfit', (groupedProfit) => groupedProfit + amountToBet )

      } else {
        return result;
      }
    }

    let averageOddsresult =  matchedBets.reduce(accumulator, Immutable.fromJS({
      'groupedProfit' : 0.0,
      'groupedLiability' : 0.0,
      'groupedStake' : 0.0,
      'averageOdds' : 0.0,
    }));

    // Average Odds (round to 2 decimal places) = (∑ Backer’s Stake + ∑ Liability) / ∑ Backer’s Stake
    // Average Odds (round to 2 decimal places) = (∑ Stake + ∑ Profit) / ∑ Stake
    // assuming ∑ Stake !== 0
    const averageOdds = ( averageOddsresult.get('groupedStake') + averageOddsresult.get('groupedProfit') ) /  averageOddsresult.get('groupedStake')

    averageOddsresult = averageOddsresult
      .set('averageOdds', averageOdds.toFixed(oddsPlaces))
      .update('groupedProfit', (groupedProfit) => CurrencyUtils.getFormattedCurrency( groupedProfit, currency, exposurePlaces, false) )
      .update('groupedLiability', (groupedLiability) => CurrencyUtils.getFormattedCurrency( groupedLiability, currency, exposurePlaces, false) )
      .update('groupedStake', (groupedStake) => CurrencyUtils.getFormattedCurrency( groupedStake, currency, stakePlaces, false) );

    return averageOddsresult;
  },

  /*
   *  =========== Average Odds (CR-036) ===========
   *  Matched Back Bets
   *  Grouped Profit = ∑ Profit
   *  Grouped Stake = ∑ Stake
   *  Average Odds (round to 2 decimal places) = (∑ Stake + ∑ Profit) / ∑ Stake
   *
   *  Matched Lay Bets
   *  Grouped Liability = ∑ Liability
   *  Grouped Backer’s Stake = ∑ Backer’s Stake
   *  Average Odds (round to 2 decimal places) = (∑ Backer’s Stake + ∑ Liability) / ∑ Backer’s Stake
   *
   *  Parameters:
   *  matchedBets - list of matched bets with the same bet type, i.e. all back or all lay
   *  currency - string representing the currency used in the final calculated values
   *  precision - by default the average odds shpuld be rounded to 2 decimal places
   *
   *  Return:
   *  Immuatable object that has the following fields:
   *    - averageOdds
   *    - groupedProfitOrLiability
   *    - groupedStake
   *
   *  There is no clear distinction between profit and liability. They are
   *  essentially calculated in the same way using odds and stake (back) or
   *  backer's stake (lay) but are presented using different labels.
   *
   *  Notes:
   *  This function expects a `normalized` bet objects. This `normalized` format
   *  is only used within the betting application. Bet objects from Blockchain
   *  should be transformed into the normalized format at the Reducer level using
   *  the following common function: /src/reducers/dataUtils.js
   *
   */
  calculateAverageOddsFromMatchedBets: function(matchedBets, currency = 'BTC', precision = 2) {
    // Assume all the bets are of the same bet type so we can just sample from the first bet
    const profitOrLiability = matchedBets.get(0).get('bet_type').toLowerCase() === 'back' ? 'profit' : 'liability';
    // profit and liability are consider the same thing with different label
    let groupedProfitOrLiability = matchedBets.reduce((sum, bet) => sum + parseFloat(bet.get(profitOrLiability)), 0.0);
    let groupedStake = matchedBets.reduce((sum, bet) => sum = parseFloat(bet.get('stake')), 0.0);
    const averageOdds = (groupedStake + groupedProfitOrLiability) / groupedStake;
    return Immutable.fromJS({
      averageOdds: averageOdds.toFixed(oddsPlaces),
      groupedProfitOrLiability: CurrencyUtils.getFormattedCurrency( groupedProfitOrLiability, currency, exposurePlaces, false),
      groupedStake: CurrencyUtils.getFormattedCurrency( groupedStake, currency, stakePlaces, false),
    });
  }
}

export default BettingModuleUtils;
