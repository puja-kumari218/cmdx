import { envConfig } from "../../../../config/envConfig";

export const missions = [
    {
        id: 1,
        name: "liquid",
        title: "Liquid Harbor directly sent to the wallet",
        icon: "liquid-icon",
        viewBox: "0 0 23.958 40.012",
        disable: true,
    },
    {
        id: 2,
        name: "mint",
        title: "Mint CMST on Harbor",
        icon: "mint-icon",
        viewBox: "0 0 30 30",
        path: "/mint",
        disable: false,
    },
    {
        id: 3,
        name: "vote",
        title: "Vote on proposal",
        icon: "vote-icon",
        viewBox: "0 0 30 32.46",
        path: "/govern",
        disable: false,
    },
    {
        id: 4,
        name: "borrow",
        title: "Lend $CMST on Commodo platform",
        icon: "lend-icon",
        viewBox: "0 0 30.023 32.127",
        path: envConfig?.commodo?.websiteUrl + "/lend",
        disable: false,
    },
    {
        id: 5,
        name: "liquidity",
        title: "LP  on cSwap dex in the  ATOM/CMDX Pool and Farm your LP Tokens",
        icon: "masterpool-icon",
        viewBox: "0 0 32 32",
        path: envConfig?.cSwap?.websiteUrl + "/farm",
        disable: false,
    },
]