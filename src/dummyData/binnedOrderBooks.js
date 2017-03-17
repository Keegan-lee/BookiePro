// TODO: Replace this with the real definition of order_book_bin
//       with amount_to_bet and amount_to_win
function OrderBookBin(odds, price) {
  this.odds = odds;
  this.price = price;
}

// TODO: Most likely Binned Order Books should not exist as standalone Blockchain objects
//       Will review this once the data can be displayed on screen

const binnedOrderBooks = [
  {
    id: '2.200.1',                    // TODO: Temp usage
    betting_market_id: '1.105.1',
    aggregated_back_bets: [new OrderBookBin(3.25, 0.173), new OrderBookBin(3.10, 0.082)],
    aggregated_lay_bets: [new OrderBookBin(2.89, 0.25), new OrderBookBin(2.10, 0.056)]
  },
  {
    id: '2.200.2',                    // TODO: Temp usage
    betting_market_id: '1.105.2',
    aggregated_back_bets: [new OrderBookBin(3.01, 0.23), new OrderBookBin(1.76, 0.06)],
    aggregated_lay_bets: [new OrderBookBin(2.19, 0.023), new OrderBookBin(1.9, 0.17)]
  }
];

//TODO: add more in this list, pay attention on the relation with the betting_markets dummy data
//TODO: for each event, make one moneyline, spread, overunder

export default binnedOrderBooks;