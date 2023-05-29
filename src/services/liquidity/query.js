import { QueryClientImpl } from "comdex-codec/build/comdex/liquidity/v1beta1/query";
import { createQueryClient } from "../helper";
import Long from 'long';
import { CSWAP_APP_ID, PRODUCT_ID } from "../../constants/common";

export const queryLiquidityPairs = (
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Pairs({
                denoms: []
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryUserOrders = (
    pairId,
    address,
    callback
) => {

    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .OrdersByOrderer({
                pairId, orderer: address.toString(),
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryPoolsList = (
    offset,
    limit,
    countTotal,
    reverse,
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Pools({
                pairId: Long.fromNumber(0),
                disabled: "false"
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};

export const queryLiquidityPair = (
    pairId,
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Pair({
                pairId,
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryLiquidityParams = (
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Params()
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

// change
export const queryPoolCoinDeserialize = (poolId, poolTokens, callback) => {
    getQueryService((error, queryService) => {
      if (error) {
        callback(error);
        return;
      }
  
      queryService
        .DeserializePoolCoin({
          appId: Long.fromNumber(APP_ID),
          poolId,
          poolCoinAmount: Long.fromNumber(poolTokens),
        })
        .then((result) => {
          callback(null, result);
        })
        .catch((error) => callback(error?.message));
    });
  };
  
  export const queryPoolSoftLocks = (farmer, poolId, callback) => {
    getQueryService((error, queryService) => {
      if (error) {
        callback(error);
        return;
      }
  
      queryService
        .Farmer({
          appId: Long.fromNumber(APP_ID),
          poolId,
          farmer,
        })
        .then((result) => {
          callback(null, result);
        })
        .catch((error) => callback(error?.message));
    });
  };
  
  export const fetchExchangeRateValue = (appId, pairId, callback) => {
    axios
      .get(
        `${comdex?.rest}/comdex/liquidity/v1beta1/order_books/${appId}?pair_ids=${pairId}&num_ticks=1`
      )
      .then((result) => {
        callback(null, result?.data);
      })
      .catch((error) => {
        callback(error?.message);
      });
  };
   


  export const queryOrder = (orderId, pairId, callback) => {
    getQueryService((error, queryService) => {
      if (error) {
        callback(error);
        return;
      }
  
      queryService
        .Order({
          pairId: Long.fromNumber(pairId),
          id: Long.fromNumber(orderId),
          appId: Long.fromNumber(APP_ID),
        })
        .then((result) => {
          callback(null, result);
        })
        .catch((error) => callback(error?.message));
    });
  };
  
  export const queryPool = (id, callback) => {
    getQueryService((error, queryService) => {
      if (error) {
        callback(error);
        return;
      }
  
      queryService
        .Pool({
          appId: Long.fromNumber(APP_ID),
          poolId: Long.fromNumber(id),
        })
        .then((result) => {
          callback(null, result);
        })
        .catch((error) => {
          callback(error?.message);
        });
    });
  };
  

  export const fetchRestAPRs = (callback) => {
    axios
      .get(`${API_URL}/api/v2/cswap/aprs`)
      .then((result) => {
        callback(null, result?.data);
      })
      .catch((error) => {
        callback(error?.message);
      });
  };
  