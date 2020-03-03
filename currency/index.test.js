const nock = require('nock');
const currency = require('./index.js');
const rate = 'https://api.exchangeratesapi.io/latest';

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

describe('currency', () => {
  
  test('should convert 1 USD to EUR', async () => {
    var opts = {'amount':1,'from':'USD','to':'EUR'};
      const data = await currency(opts);
      expect(data).toBe(0.899);
  });

  test('should convert 1 USD to USD', async () => {
    var opts = {'amount':1,'from':'USD','to':'USD'};
    const data = await currency(opts);
    expect(data).toBe(1);
  });

  test('should convert 1 EUR to USD', async () => {
    var opts = {'amount':1,'from':'EUR','to':'USD'};
      const data = await currency(opts);
      expect(data).toBe(1.1122);
  });

  test('should convert 1 BTC to USD', async () => {
    var opts = {'amount':1,'from':'BTC','to':'USD'};
      const data = await currency(opts);
      expect(data).toBe(8944.49);
  });

  test('should convert 1 BTC to EUR', async () => {
    var opts = {'amount':1,'from':'BTC','to':'EUR'};
      const data = await currency(opts);
      expect(data).toBe(8048.11);
  });

  test('should convert (with default values) without arguments', async () => {
    var opts = {};
    const data = await currency(opts);
    expect(data).toBe(1/8944.49);

  });

  test('should convert with amount only as argument', async () => {
    var opts = {'amount':1};
    const data = await currency(opts);
    expect(data).toBe(1/8944.49);
  });

  test('should convert with amount and (from) currency only as arguments', async () => {
    var opts = {'amount':1,'from':'USD'};
    const data = await currency(opts);
    expect(data).toBe(1/8944.49);
  });

  test('should return errors message for unknown `from` or `to` currency value', async () => {
    var opts = {'amount':1,'from':'j','to':'hb'};
    const data = await currency(opts);
    expect(data).toThrow();
    expect(data).toThrow(new Error);
  
    
  });

});

