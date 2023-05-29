import { QueryClientImpl } from "comdex-codec/build/comdex/market/v1beta1/query";
import Long from "long";
import { createQueryClient } from "../helper";
import { API_URL, COINGECKO_API_URL, DASHBOARD_TVL_DOLLOR_DATA, DASHBOARD_TVL_MINTED_DATA } from "../../constants/url";
import axios from "axios";

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

export const queryMarketList = (
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
      .QueryMarkets({
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

export const fetchRestPrices = (callback) => {
  var myHeaders = new Headers();
  myHeaders.append("User-Agent", "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${API_URL}/api/v2/cswap/tokens/all`, requestOptions)
    .then((response) => {
      if (response?.status === 200) {
        return response?.json();
      }
    })
    .then(result => callback(null, result?.data))
    .catch(error => callback(error?.message));
};

export const fetchCoingeckoPrices = (callback) => {
  axios
    .get(COINGECKO_API_URL)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchDashboardDollorTVL = (callback) => {
  axios
    .get(`${DASHBOARD_TVL_DOLLOR_DATA}/api/v2/harbor/tvl`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchDashboardMintedCMSTTVL = (callback) => {
  axios
    .get(`${DASHBOARD_TVL_MINTED_DATA}/api/v2/harbor/cmst/minted`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};


export const fetchRestLPPrices = (callback) => {
  axios
    .get(`${API_URL}/api/v2/cswap/lp/prices`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};