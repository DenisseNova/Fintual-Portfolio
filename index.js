const express = require('express');
const dayjs = require('dayjs');
const fs = require('fs').promises;
const { DATE_FORMAT } = require('./constants');
const Portfolio = require('./Portfolio')

const app = express();

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv');
  dotenv.config();
}

const myPortfolio = new Portfolio();
myPortfolio.addBuyStocks('AAPL', '2018-01-05', 100, 2);

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const html = await fs.readFile(`${__dirname}/index.html`, { encoding: 'utf-8' });
  res.contentType('html')
  return res.send(html);
})

app.get('/profit', async (req, res) => {
  const queryParams = req.query;
  if (!queryParams || !queryParams.dateFrom || !queryParams.dateTo) return res.status(400).json({ message: 'Debe enviar las fechas para la busqueda' })
  const dateFrom = dayjs(queryParams.dateFrom, DATE_FORMAT);
  const dateTo = dayjs(queryParams.dateTo, DATE_FORMAT);
  if (!dateFrom.isValid() || !dateTo.isValid()) return res.status(400).json({ message: 'Las fechas buscadas no son validas (YYYY-MM-DD)' })

  const data = await myPortfolio.calculate(dateFrom.format(DATE_FORMAT), dateTo.format(DATE_FORMAT))
  return res.json(data)
})

app.listen(PORT, () => {
  console.log(`App Running: http://localhost:${PORT}`)
})