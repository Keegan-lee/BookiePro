import { combineReducers } from 'redux';
import AssetReducer from './AssetReducer';
import SettingReducer from './SettingReducer';
import AppReducer from './AppReducer';
import SidebarReducer from './SidebarReducer';

import RegisterReducer from './RegisterReducer';
import LoginReducer from './LoginReducer';
import SportReducer from './SportReducer';
import EventGroupReducer from './EventGroupReducer';
import CompetitorReducer from './CompetitorReducer';
import EventReducer from './EventReducer';
import BettingMarketGroupReducer from './BettingMarketGroupReducer';
import BettingMarketReducer from './BettingMarketReducer';
import BetReducer from './BetReducer';
import HomeReducer from './HomeReducer';
import BinnedOrderBookReducer from './BinnedOrderBookReducer';
import { routerReducer } from 'react-router-redux';
import { i18nReducer } from 'react-redux-i18n'
import { reducer as formReducer } from 'redux-form'

const rootReducer = combineReducers({
  app: AppReducer,
  asset: AssetReducer,
  setting: SettingReducer,
  register: RegisterReducer,
  login: LoginReducer,
  sport: SportReducer,
  eventGroup: EventGroupReducer,
  event: EventReducer,
  competitor: CompetitorReducer,
  bettingMarketGroup: BettingMarketGroupReducer,
  bettingMarket: BettingMarketReducer,
  binnedOrderBook: BinnedOrderBookReducer,
  bet: BetReducer,
  home: HomeReducer,
  routing: routerReducer,
  form: formReducer,
  i18n: i18nReducer,
  sidebar: SidebarReducer
});

export default rootReducer;
