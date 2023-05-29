import { QueryClientImpl } from "comdex-codec/build/comdex/liquidity/v1beta1/query";
import { createQueryClient } from "../helper";
import Long from 'long';
import { CSWAP_APP_ID, PRODUCT_ID } from "../../constants/common";


export const queryPoolsList = (
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
                disabled: "false",
                appId: Long.fromNumber(CSWAP_APP_ID)
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};
export const queryFarmer = (
    poolId,
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
            .Farmer({
                appId: Long.fromNumber(CSWAP_APP_ID),
                poolId: Long.fromNumber(poolId),
                farmer: address,
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};

export const queryFarmedPoolCoin = (
    poolId,
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .FarmedPoolCoin({
                appId: Long.fromNumber(CSWAP_APP_ID),
                poolId: Long.fromNumber(poolId),
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};

export const queryDeserializePoolCoin = (
    poolId,
    poolCoinAmount,
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .DeserializePoolCoin({
                appId: Long.fromNumber(CSWAP_APP_ID),
                poolId: Long.fromNumber(poolId),
                poolCoinAmount: Long.fromNumber(poolCoinAmount)
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};

export const queryTotalActiveAndQueuedPoolCoin = (
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .TotalActiveAndQueuedPoolCoin({
                appId: Long.fromNumber(CSWAP_APP_ID),
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};



