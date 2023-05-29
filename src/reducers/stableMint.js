import { combineReducers } from "redux";
import { STABLE_MINT_VAULT_LIST, STABLE_MINT_VAULT_MINTED_DATA } from "../constants/stableMint";

const stableMintVaultList = (state = [], action) => {
    if (action.type === STABLE_MINT_VAULT_LIST) {
        return action.value
    }
    return state;
};
const lockAndMintedData = (state = [], action) => {
    if (action.type === STABLE_MINT_VAULT_MINTED_DATA) {
        return action.value
    }
    return state;
};

export default combineReducers({
    stableMintVaultList,
    lockAndMintedData
});