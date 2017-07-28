import { ChainTypes } from 'peerplaysjs-lib';
import Config from './Config';

const {
  reserved_spaces,
  object_type,
  impl_object_type
} = ChainTypes;

const {
  protocol_ids,
  implementation_ids
} = reserved_spaces;

const temporaryObjectType = {
  sport: '16',
  event_group: '17',
  event: '18',
  rule: '19',
  bmg: '20',
  bm: '21',
  bet: '22',

}
const ObjectPrefix = {
  ACCOUNT_PREFIX : protocol_ids + '.' + object_type.account,
  ASSET_PREFIX : protocol_ids + '.' + object_type.asset,
  OPERATION_HISTORY_PREFIX : protocol_ids + '.' + object_type.operation_history,
  GLOBAL_PROPERTY_PREFIX : implementation_ids + '.' + impl_object_type.global_property,
  DYNAMIC_GLOBAL_PROPERTY_PREFIX : implementation_ids + '.' + impl_object_type.dynamic_global_property,
  ACCOUNT_STAT_PREFIX : implementation_ids + '.' + impl_object_type.account_statistics,
  ACCOUNT_BALANCE_PREFIX : implementation_ids + '.' + impl_object_type.account_balance,
  // TODO: replaced with actual prefix later on
  SPORT_PREFIX : protocol_ids + '.' + temporaryObjectType.sport ,
  EVENT_GROUP_PREFIX : protocol_ids + '.' + temporaryObjectType.event_group ,
  EVENT_PREFIX : protocol_ids + '.' + temporaryObjectType.event ,
  RULE_PREFIX: protocol_ids + '.' + temporaryObjectType.rule,
  BETTING_MARKET_GROUP_PREFIX : protocol_ids + '.' + temporaryObjectType.bmg ,
  BETTING_MARKET_PREFIX : protocol_ids + '.' + temporaryObjectType.bm ,
  BET_PREFIX : protocol_ids + '.' + temporaryObjectType.bet ,
}

// If using dummy data, use the following prefix to avoid conflict
if (Config.DummyData) {
  ObjectPrefix['SPORT_PREFIX'] = 'SPORT_PREFIX'
  ObjectPrefix['EVENT_GROUP_PREFIX'] = 'EVENT_GROUP_PREFIX'
  ObjectPrefix['EVENT_PREFIX'] = 'EVENT_PREFIX'
  ObjectPrefix['RULE_PREFIX'] = 'RULE_PREFIX'
  ObjectPrefix['BETTING_MARKET_GROUP_PREFIX'] = 'BETTING_MARKET_GROUP_PREFIX'
  ObjectPrefix['BETTING_MARKET_PREFIX'] = 'BETTING_MARKET_PREFIX'
  ObjectPrefix['BET_PREFIX'] = 'BET_PREFIX'
}


export default ObjectPrefix;
