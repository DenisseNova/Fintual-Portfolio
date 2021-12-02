const axios = require('axios')
var dayjs = require('dayjs')

class Stocks {
  constructor (company, symbolCode) {
    this._company = company
    this._symbolCode = symbolCode
    this._urlApi = process.env.STOCKS_API_URL || 'https://data.nasdaq.com/api/v3'
    this._accessKey = process.env.STOCKS_API_KEY || ''
  }

  get symbolCode () {
    return this._symbolCode;
  }

  async getPrice(date) {
    if (dayjs(date, 'YYYY-MM-DD').isValid()) {
      const fecha = dayjs(date).format('YYYY-MM-DD');
      const response = await axios.get(`${this._urlApi}/datatables/WIKI/PRICES?api_key=${this._accessKey}&ticker=${this._symbolCode}&date.gte=${fecha}&date.lte=${fecha}`)
      const messageResult = { price: 0, message: 'OK' }

      if (response?.status >= 200 && response?.status < 300) {
        const data = response?.data.datatable.data || []

        if (data && data.length < 1 ){
          messageResult.message = 'No hay datos de precios para esta fecha'
          return messageResult;
        }

        messageResult.price = data[0][5];
        return messageResult;

      }else{
        console.log(response.status, response.data)
        messageResult.message = 'No fue posible obtener los datos de la API';
        return messageResult;
      }

    } else {
      messageResult.message = `La fecha ${date} no es valida para el formato YYYY-MM-DD`;
      return messageResult
    }
  }
}

module.exports = Stocks