import { LP_PRICES_SET,
   MARKET_LIST_SET, 
   SET_COINGEKO_PRICE, 
   SET_CSWAP_API_PRICE } from "../constants/oracle";

export const setMarkets = (list, pagination) => {
  const priceMap = list.reduce((map, obj) => {
    map[obj?.assetId] = obj;
    return map;
  }, {});

  return {
    type: MARKET_LIST_SET,
    list: priceMap,
    pagination,
  };
};

export const setCoingekoPrice = (value) => {
  return {
    type: SET_COINGEKO_PRICE,
    value,
  };
};

export const setCswapApiPrice = (list) => {
  const priceMap = list?.reduce((map, obj) => {
    map[obj?.denom] = obj;
    return map;
  }, {});
  return {
    type: SET_CSWAP_API_PRICE,
    priceMap,
  };
};

export const setLPPrices = (list, pagination) => {
  return {
    type: LP_PRICES_SET,
    list,
    pagination,
  };
};
