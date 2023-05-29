import { STABLE_MINT_VAULT_LIST, STABLE_MINT_VAULT_MINTED_DATA } from '../constants/stableMint'

export const setStableMintVaultList = (value) => {

    return {
        type: STABLE_MINT_VAULT_LIST,
        value,
    };
};
export const setLockAndMintedData = (value) => {

    return {
        type: STABLE_MINT_VAULT_MINTED_DATA,
        value,
    };
};