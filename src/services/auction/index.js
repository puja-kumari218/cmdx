import { QueryClientImpl } from "comdex-codec/build/comdex/auction/v1beta1/query";
import Long from "long";
import { createQueryClient } from "../helper";
import { PRODUCT_ID } from "../../constants/common";

let myClient = null;


export const getQueryService = (callback) => {
  if (myClient) {
    const queryService = new QueryClientImpl(myClient);

    return callback(null, queryService);
  } else {
    createQueryClient((error, client) => {
      if (error) {
        return callback(error);
      }
      myClient = client;
      const queryService = new QueryClientImpl(client);

      return callback(null, queryService);
    });
  }
};



export const queryDutchAuctionList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryDutchAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};
export const querySingleDutchAuction = (
  auctionId,
  auctionMappingId,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryDutchAuction({
        appId: Long.fromNumber(PRODUCT_ID),
        auctionMappingId: Long.fromNumber(auctionMappingId),
        auctionId: Long.fromNumber(auctionId),
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const querySingleDebtAuction = (
  auctionId,
  auctionMappingId,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryDebtAuction({
        appId: Long.fromNumber(PRODUCT_ID),
        auctionMappingId: Long.fromNumber(auctionMappingId),
        auctionId: Long.fromNumber(auctionId),
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryFilterDutchAuctions = (
  offset,
  limit,
  countTotal,
  reverse,
  asset,
  callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryFilterDutchAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
        denom: asset,
        history: false,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};
export const queryDutchBiddingList = (
  bidder,
  offset,
  limit,
  countTotal,
  reverse,
  history,
  callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryDutchBiddings({
        bidder,
        appId: Long.fromNumber(PRODUCT_ID),
        history: history,
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};


export const queryAuctionParams = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryGenericAuctionParams({
        appId: Long.fromNumber(PRODUCT_ID),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};



export const queryDebtAuctionList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryDebtAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryDebtBiddingList = (
  bidder,
  offset,
  limit,
  countTotal,
  reverse,
  history,
  callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryDebtBiddings({
        bidder,
        appId: Long.fromNumber(PRODUCT_ID),
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
        history: history,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const querySurplusAuctionList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QuerySurplusAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};


export const querySurplusBiddingList = (
  bidder,
  offset,
  limit,
  countTotal,
  reverse,
  history,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QuerySurplusBiddings({
        bidder,
        appId: Long.fromNumber(PRODUCT_ID),
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
        history: history,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};