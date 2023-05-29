import { SET_USER_COMDEX_ELIGIBILITY_DATA, SET_USER_ELIGIBILITY_DATA } from "../constants/airdrop";

export const setuserEligibilityData = (value) => {
    return {
        type: SET_USER_ELIGIBILITY_DATA,
        value,
    };
};

export const setuserComdexEligibilityData = (value) => {
    return {
        type: SET_USER_COMDEX_ELIGIBILITY_DATA,
        value,
    };
};