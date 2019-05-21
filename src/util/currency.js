import bitcoinConvert from 'bitcoin-convert';
import { getPoly } from 'util/polyglot';
import { getCurrencyByCode } from 'data/currencies';

// temp until we have a wallet cur module, then this will be baked into
// there and/or the currencies module
const isFiat = cur => {
  return !!getCurrencyByCode(cur);
};

// temp stub until we have a wallet curs module
const isWalletCur = code => {
  return ['BTC', 'BCH', 'LTC', 'ZEC', 'ETH'].includes(code.toUpperCase());
};

// todo: doc me up
export const fromBaseUnits = (value, cur) => {
  if (typeof value !== 'number') {
    throw new Error('Please provide a value as a number.');
  }

  if (typeof cur !== 'string' || !cur) {
    throw new Error('Please provide a currency as a non-empty string.');
  }

  // non Satoshi curs (e.g. ETH) will be wrong for now
  return isFiat(cur) ? value / 100 : value / 100000000;
};

// todo: doc me up
export const toBaseUnits = (value, cur) => {
  if (typeof value !== 'number') {
    throw new Error('Please provide a value as a number.');
  }

  if (typeof cur !== 'string' || !cur) {
    throw new Error('Please provide a currency as a non-empty string.');
  }

  // non Satoshi curs (e.g. ETH) will be wrong for now
  return isFiat(cur) ? value * 100 : value * 100000000;
};

/**
 * Will format an amount in the given currency into the format appropriate for the
 * given locale.
 * TODO: create that below
 * In many cases, instead of using this method directly, you may want to use
 * renderFormattedCurrency() from this module or its corresponding template helper,
 * formattedCurrency, since those will more robustly handle (via tooltips and icons)
 * unrecognized currency codes and/or conversion problems due to unavailable exchange
 * rate data.
 */
export function formatCurrency(amount, currency, options) {
  const opts = {
    convertAmountFromBaseUnits: true,
    // default to user lang once a setting model is in place
    locale: 'en-US',
    btcUnit: 'BTC',
    // For crypto currencies, if a symbol is specified in the cryptoCurrencies data
    // module, it will be displayed in liu of the currency code.
    useCryptoSymbol: true,
    // If you just want to format a number representing a crypto currency amount
    // but don't want any code or symbol used, set to false.
    includeCryptoCurIdentifier: true,
    ...options
  };

  // todo: perhaps a general failGracefully option should default
  // to true and on any error just return an empty string. This would
  // make things more impervious to bad or missing data.
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '';
  }

  if (typeof opts.locale !== 'string') {
    throw new Error('Please provide a locale as a string');
  }

  if (typeof currency !== 'string') {
    throw new Error('Please provide a currency as a string');
  }

  const price = opts.convertAmountFromBaseUnits
    ? fromBaseUnits(amount, currency)
    : amount;

  const cur = currency.toUpperCase();
  let curData = getCurrencyByCode(cur);

  let formattedCurrency;
  // const cryptoCur = getWalletCurByCode(cur);
  const cryptoCur = isWalletCur(cur);

  // temp
  if (cryptoCur) curData = {};

  // If we don't recognize the currency, we'll assume it's a crypto
  // listing cur.
  // const isCryptoListingCur = getCryptoListingCurs().includes(cur) ||
  //   (!cryptoCur && !curData);
  const isCryptoListingCur = !cryptoCur && !curData;

  if (cryptoCur || isCryptoListingCur) {
    opts.minDisplayDecimals =
      typeof opts.minDisplayDecimals === 'number' ? opts.minDisplayDecimals : 0;
    opts.maxDisplayDecimals =
      typeof opts.maxDisplayDecimals === 'number' ? opts.maxDisplayDecimals : 8;
  } else {
    opts.minDisplayDecimals =
      typeof opts.minDisplayDecimals === 'number' ? opts.minDisplayDecimals : 2;
    opts.maxDisplayDecimals =
      typeof opts.maxDisplayDecimals === 'number' ? opts.maxDisplayDecimals : 2;
  }

  if (cryptoCur) {
    let curSymbol = (opts.useCryptoSymbol && curData.symbol) || cur;
    let bitcoinConvertUnit;
    let amt = price;

    if (cur === 'BTC' || cur === 'TBTC') {
      switch (opts.btcUnit) {
        case 'MBTC':
          bitcoinConvertUnit = curSymbol = 'mBTC';
          break;
        case 'UBTC':
          bitcoinConvertUnit = curSymbol = 'μBTC';
          break;
        case 'SATOSHI':
          curSymbol = 'sat';
          bitcoinConvertUnit = 'Satoshi';
          break;
        default:
          bitcoinConvertUnit = 'BTC';
      }

      amt = bitcoinConvert(price, 'BTC', bitcoinConvertUnit);
    }

    const formattedAmount = (formattedCurrency = new Intl.NumberFormat(
      opts.locale,
      {
        minimumFractionDigits: opts.minDisplayDecimals,
        // maximumFractionDigits: getSmartMaxDisplayDigits(amount, opts.maxDisplayDecimals),
        maximumFractionDigits: opts.maxDisplayDecimals
      }
    ).format(amt));

    if (opts.includeCryptoCurIdentifier) {
      const translationSubKey =
        curSymbol === curData.symbol ? 'curSymbolAmount' : 'curCodeAmount';
      formattedCurrency = getPoly().t(
        `cryptoCurrencyFormat.${translationSubKey}`,
        {
          amount: formattedAmount,
          [curSymbol === curData.symbol ? 'symbol' : 'code']: curSymbol
        }
      );
    }
  } else if (isCryptoListingCur) {
    const formattedAmount = (formattedCurrency = new Intl.NumberFormat(
      opts.locale,
      {
        minimumFractionDigits: opts.minDisplayDecimals,
        // maximumFractionDigits: getSmartMaxDisplayDigits(amount, opts.maxDisplayDecimals),
        maximumFractionDigits: opts.maxDisplayDecimals
      }
    ).format(price));

    if (opts.includeCryptoCurIdentifier) {
      formattedCurrency = getPoly().t('cryptoCurrencyFormat.curCodeAmount', {
        amount: formattedAmount,
        code: cur.length > 8 ? `${cur.slice(0, 8)}…` : cur
      });
    }
  } else {
    formattedCurrency = new Intl.NumberFormat(opts.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: opts.minDisplayDecimals,
      // maximumFractionDigits: getSmartMaxDisplayDigits(amount, opts.maxDisplayDecimals),
      maximumFractionDigits: opts.maxDisplayDecimals
    }).format(price);
  }

  return formattedCurrency;
}
