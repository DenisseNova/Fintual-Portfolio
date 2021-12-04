const dayjs = require('dayjs');
const { defaultStocks, DATE_FORMAT  } = require('./constants');
const Stocks = require('./Stocks');

class Portfolio {
  constructor(stocks, profit, profitAnnual) {
    this._stocks = stocks || [];
    this._profit = profit;
    this._profitAnnul = profitAnnual;
  }
  get stocks() {
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
    if (this._stocks.some(el => el.stocks.symbolCode === symbolCode)) {
      messageResult.message = `El codigo ${symbolCode} ya esta en su lista de compras`
      return messageResult;
    }

    const newStock = new Stocks(newStockValid.companyName, newStockValid.symbolCode)
    this._stocks = [...this._stocks, { stocks: newStock, date, price, quantity }];
  }

  get profit() {
    return this._profit
  }

  async getPricesPortfolio(_dateFrom, _dateTo) {
    const dateFrom = dayjs(_dateFrom, DATE_FORMAT );
    const dateTo = dayjs(_dateTo, DATE_FORMAT );

    const purchaseByDateList = this._stocks.filter(el => {
      const formatCurrentDate = dayjs(el.date, DATE_FORMAT );
      return formatCurrentDate.isBefore(dateTo)
    });

    const portfolio = {}

    const promises = purchaseByDateList.map(async (el) => {
      const formatCurrentDate = dayjs(el.date, DATE_FORMAT );
      const validDateFrom = dateFrom.isBefore(formatCurrentDate) ? formatCurrentDate : dateFrom;

      const { prices } = await el.stocks.getPriceCartera(validDateFrom.format(DATE_FORMAT ), dateTo.format(DATE_FORMAT ))
      portfolio[el.stocks.symbolCode] = prices;
      return;
    });
    await Promise.all(promises);

    return portfolio
  }

  async calculate(_dateFrom, _dateTo) {
    const portfolio = await this.getPricesPortfolio(_dateFrom, _dateTo);

    const investmentReturns = {};

    Object.keys(portfolio).forEach((symbolData) => {
      investmentReturns[symbolData] = {
        dailySum: 0,
        RetornoEsperadoDiario : 0,
        retornoEsperadoAnual: 0,
        varianciaDiaria: 0,
        varianciaAnual: 0,
        desviacionDiaria: 0,
        desviacionAnual: 0,
        performance: 0,
        retornoPortfolio:0
      }
      const dataReturn = portfolio[symbolData].map((el, i) => {
        const nextDayPrice = portfolio[symbolData][i + 1]?.value;
        if (nextDayPrice === undefined) return 0;
        return (nextDayPrice - el.value) / el.value;
      });
      investmentReturns[symbolData].dailySum = dataReturn.reduce((acc, el) => {
        acc = acc + el;
        return acc;
      }, 0);
      investmentReturns[symbolData].RetornoEsperadoDiario =
        investmentReturns[symbolData].dailySum / dataReturn.length;
      investmentReturns[symbolData].retornoEsperadoAnual = this.getAnnualValue(
        investmentReturns[symbolData].RetornoEsperadoDiario
      );

      investmentReturns[symbolData].varianzaDiaria = this.getVariance(dataReturn);
      investmentReturns[symbolData].varianzaAnual = this.getAnnualValue(
        investmentReturns[symbolData].varianzaDiaria
      );

      investmentReturns[symbolData].desviacionDiaria = this.getStandardDeviation(
        dataReturn
      );
      investmentReturns[symbolData].desviacionAnual = this.getAnnualValue(
        investmentReturns[symbolData].desviacionDiaria
      );

      investmentReturns[symbolData].performance =
        investmentReturns[symbolData].RetornoEsperadoDiario /
        investmentReturns[symbolData].desviacionDiaria;

      //0.1045%

      const culcularPortfolio = this.getAllWI()
    })


    return investmentReturns;
  }
  getAnnualValue(value) {
    return (((value / 100 ) + 1) ** 360 - 1) * 100;
  }

  getVariance(arr = []) {
    if (arr.length < 1) return 0;
    const sum = arr.reduce((acc, val) => acc + val);
    const avg = sum / arr.length;
    let variance = 0;
    arr.forEach((el) => {
      variance += (el - avg) * (el - avg);
    });
    variance = variance / arr.length;
    return variance;
  };

  getStandardDeviation(arr = []) {
    if (arr.length < 1) return 0;
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b) / n;
    return Math.sqrt(
      arr.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
    );
  }

  getCapital() {
    return this._stocks.reduce((acc, el) => {
      acc = acc + (el.price * el.quantity);
      return acc;
    }, 0);
  }

  getAllWI() {
    const capital = this.getCapital();
    return this._stocks.map((el) => {
      return {
        symbolCode: el.stocks.symbolCode,
        WI: (((el.price * el.quantity) / capital) * 100).toFixed(2)
      }
    })
  }

 
}

module.exports = Portfolio