import { envConfig } from "../config/envConfig";

let app = process.env.REACT_APP_APP;

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const HALF_DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_FEE = 100000;
export const DOLLAR_DECIMALS = 2;
export const ZERO_DOLLAR_DECIMALS = 0;
export const TOTAL_ACTIVITY = 5;
export const TOTAL_VEHARBOR_ACTIVITY = 4;
export const DEFAULT_CHAIN_ID_FOR_CLAIM_AIRDROP = 1;
export const HARBOR_ASSET_ID = 9;
export const MAX_SLIPPAGE_TOLERANCE = 3;
export const PRICE_DECIMALS = 4;


export const APP_ID = Number(envConfig?.[app]?.appId);

export const PRODUCT_ID = Number(envConfig?.[app]?.appId);
export const CSWAP_APP_ID = Number(envConfig?.cSwap?.appId); // for testnet appId is 1, and for devnet appId is 2
export const HOSTED_ON_TEXT = process.env.REACT_APP_HOSTED_ON_TEXT;
export const MASTER_POOL_ID = Number(envConfig?.[app]?.masterPoolId);
export const NETWORK_TAG = envConfig?.[app]?.networkTag;
