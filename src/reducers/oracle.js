import { combineReducers } from "redux";
import { 
  LP_PRICES_SET, 
  MARKET_LIST_SET, 
  SET_COINGEKO_PRICE, 
  SET_CSWAP_API_PRICE } from "../constants/oracle";

const market = (
  state = {
    map: {},
    pagination: {},
    coingekoPrice: {},
    cswapApiPrice: {},
  },
  action
) => {
  switch (action.type) {
    case MARKET_LIST_SET:
      return {
        ...state,
        map: action?.list,
        pagination: action?.pagination,
      };
    case SET_COINGEKO_PRICE:
      return {
        ...state,
        coingekoPrice: action.value,
      };
    case SET_CSWAP_API_PRICE:
      return {
        ...state,
        cswapApiPrice: action.priceMap,
      };
    default:
      return state;
  }

};

const lpPrice = (
  state = {
    list: [],
  },
  action
) => {
  if (action.type === LP_PRICES_SET) {
    return {
      ...state,
      list: action?.list,
    };
  }

  return state;
};

export default combineReducers({
  market,
  lpPrice,
});
