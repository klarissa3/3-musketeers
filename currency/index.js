const axios = require('axios');
const money = require('money');

const RATES_URL = 'https://api.exchangeratesapi.io/latest';
const BLOCKCHAIN_URL = 'https://blockchain.info/ticker';
const CURRENCY_BITCOIN = 'BTC';

const isAnyBTC = (from, to) => [from, to].includes(CURRENCY_BITCOIN);


/**
 * @typedef {Object} opts 
 * @prop {Number} amount -Amount of money you want to convert
 * @prop {String} from -Currency of reference
 * @prop {String} to -Currency converted
 */
/**
 * Enter default parameters
 * @param opts -The options
 * @return {String} -The conversion wanted
 */
module.exports = async opts => {
  const {amount = 1, from = 'USD', to = CURRENCY_BITCOIN} = opts;
  const promises = [];
  let base = from;

  /**
   * @param {String} from
   * @param {String} to
   * @return {Bool} -If one of the parameters are equal to BTC
  */
  const anyBTC = isAnyBTC(from, to);

  if (anyBTC) {
    base = from === CURRENCY_BITCOIN ? to : from;
    promises.push(axios(BLOCKCHAIN_URL));
  }

  promises.unshift(axios(`${RATES_URL}?base=${base}`));

  try {
    const responses = await Promise.all(promises);
    const [rates] = responses;

    money.base = rates.data.base;
    money.rates = rates.data.rates;

    const conversionOpts = {
      from,
      to
    };

    if (anyBTC) {
      const blockchain = responses.find(response =>
        response.data.hasOwnProperty(base)
      );

      Object.assign(money.rates, {
        'BTC': blockchain.data[base].last
      });
    }

    if (anyBTC) {
      Object.assign(conversionOpts, {
        'from': to,
        'to': from
      });
    }

    return money.convert(amount, conversionOpts);
  } catch (error) {
    throw new Error (
      "💵 Please specify a valid `from` and/or `to` currency value!"
    );
  }
};
