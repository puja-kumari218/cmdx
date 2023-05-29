import { Decimal } from "@cosmjs/math";
import { ibcDenoms } from "../config/network";
import { DOLLAR_DECIMALS } from "../constants/common";
import { denomToCoingeckoTokenId } from "./string";

export const formatNumber = (number) => {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(DOLLAR_DECIMALS) + "K";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(DOLLAR_DECIMALS) + "M";
  } else if (number < 1000) {
    return number;
  }
};

export const commaSeparator = (value) => {
  const array = value.toString().split(".");
  const stringWithComma = array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (array[1]) {
    return stringWithComma.concat(".", array[1]);
  }

  return stringWithComma;
};

export const decimalConversion = (data) => {
  return Decimal.fromAtomics(data || "0", 18).toString();
};

export const truncateToDecimals = (num, dec = 2) => {
  const calcDec = Math.pow(10, dec);
  return Math.trunc(num * calcDec) / calcDec;
};

export const marketPrice = (marketsMap, denom, assetId, coinGeckoPrice, cswapPrice) => {
  const value = marketsMap?.map[assetId]

  if (denom === "ucmst") {
    return 1
  }

  if (value && value?.twa && value?.isPriceActive) {
    return value?.twa?.toNumber() / 1000000;
  }


  return 0;
};

export const calculateROI = (principal, interestRate, years, months, days) => {
  const earns =
    Number(principal) *
    (1 + Number(interestRate) / 100) **
    (Number(years) + Number(months) / 12 + Number(days) / 365);
  if (earns) {
    return earns.toFixed(DOLLAR_DECIMALS);
  } else {
    return 0;
  }
};

export const getAccountNumber = (value) => {
  return value === "" ? "0" : value;
};

export const getExponent = (number) => {
  let count = 0;
  while (number > 1) {
    number = number / 10;
    count++;
  }

  return count;
};

export const detectBestDecimalsDisplay = (
  price,
  minDecimal = 2,
  minPrice = 1,
  maxDecimal
) => {
  if (price && price > minPrice) return minDecimal;
  let decimals = minDecimal;
  if (price !== undefined) {
    // Find out the number of leading floating zeros via regex
    const priceSplit = price.toString().split(".");
    if (priceSplit.length === 2 && priceSplit[0] === "0") {
      const leadingZeros = priceSplit[1].match(/^0+/);
      decimals += leadingZeros ? leadingZeros[0].length + 1 : 1;
    }
  }
  if (maxDecimal && decimals > maxDecimal) decimals = maxDecimal;
  return decimals;
};

export const formateNumberDecimalsAuto = ({
  price,
  maxDecimal,
  unit,
  minDecimal,
  minPrice,
}) => {
  minDecimal = minDecimal ? minDecimal : 2;
  minPrice = minPrice ? minPrice : 1;
  let res =
    formateNumberDecimals(
      price,
      detectBestDecimalsDisplay(price, minDecimal, minPrice, maxDecimal)
    ) + (unit ? unit : "");
  return res;
};

export const formateNumberDecimals = (price, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: decimals,
  }).format(price);
};


// change
export const getAMP = (currentPrice, minimumPrice, maximumPrice) => {
  return (
    1 /
    (1 -
      (1 / 2) *
        (Math.sqrt(minimumPrice / currentPrice) +
          Math.sqrt(currentPrice / maximumPrice)))
  );
};
// change
export const rangeToPercentage = (min, max, input) =>
  Number(((input - min) * 100) / (max - min))?.toFixed(0);
