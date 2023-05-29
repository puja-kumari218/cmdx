import { SET_OWNER_COLLATERAL, SET_USER_LOCKED_VAULT_DATA } from "../constants/mint";

export const setUserLockedVaultData = (value) => {

    return {
        type: SET_USER_LOCKED_VAULT_DATA,
        value,
    };
};
export const setOwnerCurrentCollateral = (value) => {

    return {
        type: SET_OWNER_COLLATERAL,
        value,
    };
};