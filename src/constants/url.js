import { envConfig } from "../config/envConfig";

export const getPriceChartURL = (range) => {
  return `https://api-osmosis.imperator.co/tokens/v2/historical/CMDX/chart?tf=${range}`;
};

// tf = range 60- 1H, 1440 - 1D, 10080 - 1W,  43800 - 1M
export const CAMPAIGN_URL = "https://test-campaign.comdex.one";

export const API_URL = envConfig?.apiUrl;

// export const EMISSION_API_URL = "http://95.217.185.27:8000";
export const EMISSION_API_URL = envConfig?.apiUrl;

export const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=comdex,cosmos,osmosis,axlusdc,axlweth&vs_currencies=usd";
export const HARBOR_AIRDROP_API_URL = envConfig?.harbor?.harborAirdropApiUrl;
export const DASHBOARD_TVL_DOLLOR_DATA = envConfig?.harbor?.harborDashboardTVLApiUrl;
export const DASHBOARD_TVL_MINTED_DATA = envConfig?.harbor?.harborDashboardTVLApiUrl;