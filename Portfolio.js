const dayjs = require('dayjs');
const { defaultStocks } = require('./constants');
const Stocks = require('./Stocks');

class Portfolio {
  constructor (stocks, profit, profitAnnual) {
    this._stocks = stocks || [];
    this._profit = profit;
    this._profitAnnul = profitAnnual;
  }
  get stocks () {
    return this._stocks;
  }

  set stocks(newStocks) {
    this._stocks = newStocks;
  }

  addBuyStocks(symbolCode, date, price, quantity) {
    const newStockValid = defaultStocks.find(el => el.symbolCode === symbolCode);

    if (!newStockValid) {
      const messageResult = { message: 'OK' }
      messageResult.message = `El codigo ${symbolCode} no esta disponible en nuestra lista de opraciónes`
      console.log(messageResult)
      return messageResult;

    }
    if (this._stocks.some(el => el.stocks.symbolCode === symbolCode)){
      messageResult.message = `El codigo ${symbolCode} ya esta en su lista de compras`
      return messageResult;
    }

    const newStock = new Stocks(newStockValid.companyName, newStockValid.symbolCode)
    this._stocks = [...this._stocks, { stocks: newStock, date, price, quantity }];
  }

  get profit () {
    return this._profit
  }
}


module.exports = Portfolio