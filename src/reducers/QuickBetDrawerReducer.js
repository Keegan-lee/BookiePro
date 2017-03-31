import { ActionTypes } from '../constants';
import Immutable from 'immutable';

let initialState = Immutable.fromJS({
  bets: [],
});

export default function(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.QUICK_BET_DRAWER_ADD_QUICK_BET: {
      return state.merge({
        bets: state.get('bets').push(action.bet)
      });
    }
    default:
      return state;
  }
};
