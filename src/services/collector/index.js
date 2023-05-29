import { QueryClientImpl } from "comdex-codec/build/comdex/collector/v1beta1/query";
import { createQueryClient } from "../helper";
import { PRODUCT_ID } from "../../constants/common";
import Long from "long";

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



export const queryCollectorInformation = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryCollectorLookupByApp({
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