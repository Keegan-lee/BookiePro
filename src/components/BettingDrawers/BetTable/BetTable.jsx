/**
 * BetTable is a compoent used exclusively in QuickBetDrawer and MarketDrawer. As
 * its name implies, it is table showing bets data. It is a pure presentational
 * component that does not have any internal state at all. All behaviors are
 * driven by props passed from the parent component.
 *
 * BetTable displays the bets using 2 Ant-Design tables stacking on top of one
 * another. The top table shows the Back bets and the bottom table shows the Lay
 * bets.
 *
 * BetTable operates in 2 modes: READONLY and READWRITE (default). In READONLY mode,
 * all values are displayed as text.
 */
import React from 'react';
import { Button, Icon, Table } from 'antd';
import Immutable from 'immutable';
import { I18n } from 'react-redux-i18n';
import CurrencyUtils from '../../../utility/CurrencyUtils';
import { incrementOdds, decrementOdds, adjustOdds, MIN_ODDS } from './oddsIncrementUtils';

/**
 * Render the team name and the market group of the associated bet. This is used
 * to render the content for the first column of the BetTable (BACK / LAY).
 *
 * This function reads the #betting_market_description (team name) and
 * #betting_market_description (market type) from the bet object.
 *
 * @param {string} text - ignore, this value is always undefined or null
 * @param {object} record - the bet object
 */
const renderTeam = (text, record) => (
  <div>
    <div className='team'>{ record.betting_market_description }</div>
    <div className='market_type'>{ record.betting_market_group_description }</div>
  </div>
);

/**
 * Returns a function that renders an Input field.
 *
 * Any changes made in the input field will trigger an event (defined by the
 * `action` param) to be fired and the value will be updated in the Redux store.
 * The details about which Redux state to be updated and which action/reducer pair
 * to be invoked are all hidden from BetTable.
 *
 * @param {string} field - the name of the field the returned function should render
 * @param {Function} action - a callback function which handles value change in
 * the Input field
 * @param {string} currencyFormat - a string representing the currency format to
 * be used to format the Odds or Stake values on screen
 * @returns {Function} - the actual cell rendering function used by antd Table
 */
const renderInput = (field, action, currencyFormat) => {
  return (text, record) => {
    // antd table records are vanilla JS objects
    // we cannot use antd Input component here because we have problem
    // changing the value if user clicks on an offer from the same market
    return (
      <input
        type='text'
        value={ text === undefined? '' : text }
        className='ant-input'
        onChange={
          (event) => {
            // REVIEW: One line Regular Expression error check
            //         Reject any input that leads to invalid number
            if ( event.target.value.length !== 0) {
              const stakePrecision = CurrencyUtils.fieldPrecisionMap[field][currencyFormat];

              if ( stakePrecision === 0){
                // should only accept integers when precision is zero
                if (!/^[-+]?[1-9]\d*$/.test((event.target.value))) return false;
              } else {
                const regex = new RegExp(`^\\d*\\.?\\d{0,${stakePrecision}}$`);
                if (!regex.test(event.target.value)) return false;
              }
            }

            const delta = Immutable.Map()
              .set('id', record.id)
              .set('field', field)
              .set('value', event.target.value);
            action(delta);
          }
        }
        onBlur={
          (event) => {
            // Assume values have been vented already in onChange
            const floatNumber = parseFloat(event.target.value);
            if (isNaN(floatNumber)) return false; // fail fast if the value is undefined or bad

            let value = event.target.value;
            if (field === 'odds') {
              value = adjustOdds(CurrencyUtils.formatFieldByCurrencyAndPrecision(
                        field, floatNumber, currencyFormat
                      ), record.bet_type);
            }
            if (field === 'stake') {
              value = CurrencyUtils.toFixed('stake', floatNumber, currencyFormat);
            }
            const delta = Immutable.Map()
              .set('id', record.id)
              .set('field', field)
              .set('value', value);
            action(delta);
          }
        }
      />
    );
  }
}

/**
 * Handles click events from the arrow buttons for incrementing or decrementing
 * Odds values.
 *
 * If the Odds value is not available, this function will set a minimum odds value.
 * The updated Odds value is updated in the Redux store via executing an action.
 *
 * @param {object} record - the raw data record, which is a vanilla JS object
 * @param {Function} action - a callback function which handles value change in the
 * @param {Function} updateOdds - a callback function that adjust the Odds value
 * to make sure it falls into one of the predefined value ranges
 */
const clickArrowButton = (record, action, updateOdds) => {
  let odds = record.odds;
  if (!odds) {
    odds = MIN_ODDS;
  } else {
    // REVIEW the odds value is adjusted first because the dummy data may contain
    //        incorrect odds values that could never happen in the real Blockchain
    odds = updateOdds(adjustOdds(odds, record.bet_type));
  }
  const delta = Immutable.Map()
    .set('id', record.id)
    .set('field', 'odds')
    .set('value', odds);
  action(delta);
}

/**
 * Returns a function that renders the Odds cells in the BetTable.
 *
 * This function executes #renderInput to render the Input field and then renders
 * the up and down arrow buttons for adjusting Odds value. Each of the buttons
 * will invoke the #clickArrowButton with the appropriate update functions defined
 * in the {@link oddsIncrementUtils} module.
 *
 * @param {Function} action - a callback function which handles value change in
 * the Input field.
 * @param {string} currencyFormat - a string representing the currency format to
 * be used to format the Odds or Stake values on screen
* @returns {Function} - the actual cell rendering function used by antd Table
 */
const renderOdds = (action, currencyFormat) => {
  return (text, record) => {
    return (
      <div className='pos-rel'>
        { renderInput('odds', action, currencyFormat)(text, record) }
        <a className='arrow-icon-main icon-up' onClick={ () => clickArrowButton(record, action, incrementOdds) }><i className='icon-arrow icon-up-arrow'></i></a>
        <a className='arrow-icon-main icon-down' onClick={ () => clickArrowButton(record, action, decrementOdds) }><i className='icon-arrow icon-down-arrow'></i></a>
      </div>
    );
  }
}

/**
 * Returns a function that renders the delete button for each row in the BetTable.
 *
 * The callback function in the paremeters will trigger an action to delete the
 * bet (represented as the #record argument) in the actual rendering function.
 * This function encapulates the actual details of the operation: it could be
 * deleting a bet slip from the Redux store or requesting the Blockchain to
 * cancel a bet.
 *
 * @param {Function} deleteOne - a callback function that triggers event to delete
 * the bet. This callback accepts an ImmutableJS object as its sole argument.
 * @returns {Function} - the actual cell rendering function used by antd Table
 */
const renderDeleteButton = (deleteOne) => {
  return (text, record) => (
    <Button className='btn'
      onClick={ () => deleteOne(Immutable.fromJS(record)) }
    ><Icon type='close'/></Button>
  );
}

/**
 * Returns an array of column definition objects of the Back Bet Table.
 *
 * In READONLY mode:
 * - the column that contains the Delete Button is NOT available
 * - all field value are rendered as text in READONLY mode
 *
 * @param {Function} deleteOne - the callback function used to delete/cancel a bet
 * @param {Function} updateOne - the callback function triggered after a bet has
 * been udpated
 * @param {string} currencyFormat - a string representing the currency format to
 * be used to format the Odds or Stake values on screen
 * @param {boolean} [readonly=false] - set to true if the BetTable is in READONLY
 * mode, and false otherwise
 * @returns {Array.object} - an array of column definition objects
 */
const getBackColumns = (deleteOne, updateOne, currencyFormat, readonly=false) => {
  const currencySymbol = CurrencyUtils.getCurruencySymbol(currencyFormat);
  const teamColumn = {
    title: 'BACK',
    dataIndex: 'back',
    key: 'back',
    width: '26%',
    className: 'team',
    render: renderTeam,
  };

  const oddsColumn = {
    title: 'ODDS',
    dataIndex: 'odds',
    key: 'odds',
    width: '21%',
    className: 'numeric readonly',
  };
  if (!readonly) {
    oddsColumn['render'] = renderOdds(updateOne, currencyFormat);
    oddsColumn['className'] = 'numeric';
  }

  const stakeColumn = {
    title: `STAKE(${currencySymbol})`,
    dataIndex: 'stake',
    key: 'stake',
    width: '21%',
    className: 'numeric readonly',
  }
  if (!readonly) {
    stakeColumn['render'] = renderInput('stake', updateOne, currencyFormat);
    stakeColumn['className'] = 'numeric';
  }

  const profitColumn = {
    title: `PROFIT(${currencySymbol})`,
    dataIndex: 'profit',
    key: 'profit',
    className: 'numeric readonly' // this field is always readonly
  }
  if (!readonly) {
    profitColumn['width'] = '28%';
  }

  const columns = [teamColumn, oddsColumn, stakeColumn, profitColumn];
  if (!readonly) {
    // delete button
    columns.push({
      title: '',
      dataIndex: 'delete',
      key: 'delete',
      className: 'delete-button',
      render: renderDeleteButton(deleteOne),
    })
  }

  return columns;
};

/**
 * Returns an array of column definition objects of the Lay Bet Table.
 *
 * In READONLY mode:
 * - the column that contains the Delete Button is NOT available
 * - all field value are rendered as text in READONLY mode
 *
 * @param {Function} deleteOne - the callback function used to delete/cancel a bet
 * @param {Function} updateOne - the callback function triggered after a bet has
 * been udpated
 * @param {string} currencyFormat - a string representing the currency format to
 * be used to format the Odds or Stake values on screen
 * @param {boolean} [readonly=false] - set to true if the BetTable is in READONLY
 * mode, and false otherwise
 * @returns {Array.object} - an array of column definition objects
 */
const getLayColumns = (deleteOne, updateOne, currencyFormat, readonly=false) => {
  const currencySymbol = CurrencyUtils.getCurruencySymbol(currencyFormat);
  const teamColumn = {
    title: 'LAY',
    dataIndex: 'lay',
    key: 'lay',
    width: '26%',
    className: 'team',
    render: renderTeam,
  };

  const oddsColumn = {
    title: 'ODDS',
    dataIndex: 'odds',
    key: 'odds',
    width: '21%',
    className: 'numeric readonly',
  }
  if (!readonly) {
    oddsColumn['render'] = renderOdds(updateOne, currencyFormat);
    oddsColumn['className'] = 'numeric';
  }

  const stakeColumn = {
    title: `BACKER'S STAKE(${currencySymbol})`,
    dataIndex: 'stake',
    key: 'stake',
    width: '21%',
    className: 'numeric readonly',
  }
  if (!readonly) {
    stakeColumn['render'] = renderInput('stake', updateOne, currencyFormat);
    stakeColumn['className'] = 'numeric';
  }

  const liabilityColumn =  {
    title: `LIABILITY(${currencySymbol})`,
    dataIndex: 'liability',
    key: 'liability',
    className: 'numeric readonly' // this field is always readonly
  }
  if (!readonly) {
    liabilityColumn['width'] = '28%';
  }

  const columns = [teamColumn, oddsColumn, stakeColumn, liabilityColumn];
  if (!readonly) {
    // delete button
    columns.push({
      title: '',
      dataIndex: 'delete',
      key: 'delete',
      className: 'delete-button',
      render: renderDeleteButton(deleteOne),
    })
  }

  return columns;
};

/**
 * Preprocess the bets data before passing them to the antd Table. This is written
 * as a function because the same procedures need to be applied to both Back
 * and Lay bets.
 *
 * Two key operations are performed:
 * - initialize empty `profit` and `liability` field
 * - set a unique key to every record so that React will not complain
 *
 * @param {object} bets - a ImmutableJS List of ImmutableJS Map objects
 * @param {string} currencyFormat - a string representing the currency format to
 * be used to format the Odds or Stake values on screen
 * @returns {object} - a ImmutableJS List of ImmutableJS Map objects representing
 * the bets data
 */
const buildBetTableData = (bets, currencyFormat) => {
  const formatting = (field, value) => {
    const floatNumber = parseFloat(value);
    return isNaN(floatNumber) ? value : CurrencyUtils.toFixed(field, floatNumber, currencyFormat);
  }
  return bets.map((bet, idx) => {
    return bet.set('key', idx)
              .update('profit', profit => formatting('profit', profit))
              .update('liability', liability => formatting('liability', liability))
  });
}

/**
 * Return the css class of a row. The css class `updated` will cause the entire
 * row to be highlighted in a different color which indicated there is an updated
 * field in this row.
 *
 * The function signature is defined by Ant-Design.
 *
 * @param {object} record - the bet data represented as a vanilla JS object
 * @param {number} index - unclear this is not clearly explained in the antd API
 * @returns {string} - either `updated` or empty string
 */
const getRowClassName = (record, index) => (
  record.updated ? 'updated' : ''
)

const BetTable = (props) => {
  const { readonly, data, title, deleteOne, deleteMany, updateOne, dimmed, currencyFormat } = props;
  const backBets = data.get('back') || Immutable.List();
  const layBets = data.get('lay') || Immutable.List();
  return (
    <div className={ `bet-table-wrapper ${dimmed ? 'dimmed' : '' }` }>
      <div className='header'>
        <span className='title'>{ title }</span>
        { !readonly && !(backBets.isEmpty() && layBets.isEmpty()) &&
          <span className='icon' onClick={ () => deleteMany(backBets.concat(layBets), title) }>
            <i className='trash-icon'></i>
          </span>
        }
      </div>
      <div className='bet-table'>
        {
          backBets.isEmpty() && layBets.isEmpty() &&
          <div className='no-bets'>
            <div className='message'>
              { I18n.t('market_drawer.unmatched_bets.no_data') }
            </div>
          </div>
        }
        {
          !backBets.isEmpty() &&
          <div className='back'>
            <Table
              pagination={ false }
              columns={ getBackColumns(deleteOne, updateOne, currencyFormat, readonly) }
              dataSource={ buildBetTableData(backBets, currencyFormat).toJS() }
              rowClassName={ getRowClassName }
            />
          </div>
        }
        {
          !layBets.isEmpty() &&
          <div className='lay'>
            <Table
              pagination={ false }
              columns={ getLayColumns(deleteOne, updateOne, currencyFormat, readonly) }
              dataSource={ buildBetTableData(layBets, currencyFormat).toJS() }
              rowClassName={ getRowClassName }
            />
          </div>
        }
      </div>
    </div>
  );
}

export default BetTable;
