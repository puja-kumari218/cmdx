import Long from "long";
import { createQueryClient } from "../helper";
import { QueryClientImpl } from "comdex-codec/build/comdex/locker/v1beta1/query";
import { PRODUCT_ID } from "../../constants/common";


let myClient = null;

const getQueryService = (callback) => {
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



export const queryLockerWhiteListedAssetByProduct = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryWhiteListedAssetByAllProduct()
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};




export const queryLockerWhiteListedAssetByProductId = (productId, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryWhiteListedAssetIDsByAppID({
        appId: Long.fromNumber(productId),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryUserLockerByProductAssetId = (
  productId,
  assetId,
  owner,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryOwnerLockerByAppToAssetIDbyOwner({
        appId: Long.fromNumber(productId),
        assetId: Long.fromNumber(assetId),
        owner: owner,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryUserLockedValueInLocker = (
  productId,
  assetId,
  owner,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryOwnerLockerByAppToAssetIDbyOwner({
        appId: Long.fromNumber(productId),
        assetId: Long.fromNumber(assetId),
        owner: owner,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};


export const queryLockerLookupTableByApp = (productId, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryLockerLookupTableByApp({
        appId: Long.fromNumber(productId),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryUserLockerHistory = (
  assetId,
  productId,
  owner,
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
      .QueryOwnerTxDetailsLockerOfAppByOwnerByAsset({
        appId: Long.fromNumber(productId),
        assetId: Long.fromNumber(assetId),
        owner: owner,
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


export const queryUserLockerStats = (
  owner,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryLockerByAppByOwner({
        appId: Long.fromNumber(PRODUCT_ID),
        owner: owner,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};