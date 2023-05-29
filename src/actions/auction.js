import {
  AUCTION_LIST_SET,
  BIDDING_LIST_SET,
  BID_AMOUNT_SET,
  CURRENT_AUCTION_SET,
  SET_AUCTION_PAGE_NUMBER,
  SET_AUCTION_PAGE_SIZE,
  SET_SELECTED_AUCTIONED_ASSET,
} from "../constants/auction";

export const setAuctions = (list, pagination) => {
  return {
    type: AUCTION_LIST_SET,
    list,
    pagination,
  };
};
export const setAuctionsPageSize = (value) => {
  return {
    type: SET_AUCTION_PAGE_SIZE,
    value,
  };
};

export const setAuctionsPageNumber = (value) => {
  return {
    type: SET_AUCTION_PAGE_NUMBER,
    value,
  };
};

export const setBiddings = (list, pagination, bidder) => {
  return {
    type: BIDDING_LIST_SET,
    list,
    pagination,
    bidder,
  };
};

export const setCurrentAuction = (value) => {
  return {
    type: CURRENT_AUCTION_SET,
    value,
  };
};

export const setBidAmount = (value) => {
  return {
    type: BID_AMOUNT_SET,
    value,
  };
};
export const setSelectedFilterAuctionAsset = (value) => {
  return {
    type: SET_SELECTED_AUCTIONED_ASSET,
    value,
  };
};
