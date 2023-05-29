import { combineReducers } from "redux";
import {
  AUCTION_LIST_SET,
  BIDDING_LIST_SET,
  BID_AMOUNT_SET,
  CURRENT_AUCTION_SET,
  SET_AUCTION_PAGE_NUMBER,
  SET_AUCTION_PAGE_SIZE,
  SET_SELECTED_AUCTIONED_ASSET,
} from "../constants/auction";

const auctions = (state = "", action) => {
  if (action.type === AUCTION_LIST_SET) {
    return {
      auctions: action.list,
      pagination: action.pagination,
    }
  }

  return state;
};

const auctionsPageSize = (state = 10, action) => {
  if (action.type === SET_AUCTION_PAGE_SIZE) {
    return action.value;
  }

  return state;
};

const auctionsPageNumber = (state = 1, action) => {
  if (action.type === SET_AUCTION_PAGE_NUMBER) {
    return action.value;
  }

  return state;
};

const _ = (state = {}, action) => {
  if (action.type === CURRENT_AUCTION_SET) {
    return action.value || state;
  }

  return state;
};

const bidAmount = (state = 0, action) => {
  if (action.type === BID_AMOUNT_SET) {
    return action.value;
  }

  return state;
};
const selectedAuctionedAsset = (state = [], action) => {
  if (action.type === SET_SELECTED_AUCTIONED_ASSET) {
    return action.value;
  }

  return state;
};

const bidding = (
  state = {
    list: [],
    pagination: {},
    bidder: "",
  },
  action
) => {
  if (action.type === BIDDING_LIST_SET) {
    return {
      ...state,
      list: action.list,
      pagination: action.pagination,
      bidder: action.bidder,
    };
  }

  return state;
};

export default combineReducers({
  auctions,
  _,
  bidAmount,
  bidding,
  selectedAuctionedAsset,
  auctionsPageSize,
  auctionsPageNumber
});
