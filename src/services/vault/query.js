import Long from "long";
import { createQueryClient } from "../helper";
import { QueryClientImpl } from 'comdex-codec/build/comdex/vault/v1beta1/query'
import { PRODUCT_ID } from "../../constants/common";

let myClient = null;

const getQueryService = (callback) => {
    if (myClient) {
        const queryService = new QueryClientImpl(myClient);

        return callback(null, queryService);
    } else {
        createQueryClient((error, client) => {
            if (error) {
                callback(error);
            }
            myClient = client;
            const queryService = new QueryClientImpl(client);

            return callback(null, queryService);
        });
    }
};



export const queryTotalTokenMinted = (productId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryTokenMintedAssetWiseByApp({
                appId: Long.fromNumber(productId)
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};



export const queryExtendedPairVault = (productId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryExtendedPairIDsByApp({
                appId: Long.fromNumber(productId)
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};



export const queryVaultByProductId = (
    product,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryAllVaultsByApp({
                appId: Long.fromNumber(product)
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};



export const queryUserVaults = (
    owner,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryVaultInfoOfOwnerByApp({
                appId: Long.fromNumber(PRODUCT_ID),
                owner: owner
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};


export const queryVaults = (id, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error)
        }
        queryService
            .QueryVault({
                id: id
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    })
}



export const queryOwnerVaults = (productId, address, extentedPairId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error)
        }
        queryService
            .QueryVaultIDOfOwnerByExtendedPairAndApp({
                appId: Long.fromNumber(productId),
                owner: address,
                extendedPairId: Long.fromNumber(extentedPairId),
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    })
}


export const queryOwnerVaultsInfo = (ownerVaultId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error)
        }
        queryService
            .QueryVault({
                id: Long.fromNumber(ownerVaultId),
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);

            });
    })
}


export const queryAllVaultByProduct = (productId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error)
        }
        queryService
            .QueryVaultIdsByAppInAllExtendedPairs({
                appId: Long.fromNumber(productId),
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);

            });
    })
}



export const queryMintedTokenSpecificVaultType = (productId, extendedPairId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error)
        }
        queryService
            .QueryTokenMintedByAppAndExtendedPair({
                appId: Long.fromNumber(productId),
                extendedPairId: Long.fromNumber(extendedPairId),
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);

            });
    })
}



export const queryAppTVL = (appId, callback) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }

        queryService
            .QueryTVLByAppOfAllExtendedPairs({
                appId: Long.fromNumber(appId),
            }).then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};



export const queryUserVaultsStats = (
    owner,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryUserMyPositionByApp({
                owner: owner,
                appId: Long.fromNumber(PRODUCT_ID)
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};


export const queryUserVaultsInfo = (
    id,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryVaultInfoByVaultID({
                id: Long.fromNumber(id),
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};


export const queryVaultMintedStatistic = (
    productId,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryPairsLockedAndMintedStatisticByApp({
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

export const queryStableVaultStatistic = (
    extendedPairId,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryStableVaultByAppAndExtendedPair({
                appId: Long.fromNumber(PRODUCT_ID),
                extendedPairId: Long.fromNumber(extendedPairId)
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};
export const queryStableVault = (
    appId,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryStableVaultByApp({
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

export const queryStableBalanceUserPosition = (
    address,
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryUserMyPositionByApp({
                appId: Long.fromNumber(PRODUCT_ID),
                owner: address
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message);
            });
    });
};

export const queryPairsLockedAndMintedStatistic = (
    callback
) => {
    getQueryService((error, queryService) => {
        if (error) {
            callback(error);
            return;
        }
        queryService
            .QueryPairsLockedAndMintedStatisticByApp({
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