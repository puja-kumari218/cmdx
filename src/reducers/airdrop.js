import { combineReducers } from "redux";
import { SET_USER_COMDEX_ELIGIBILITY_DATA, SET_USER_ELIGIBILITY_DATA } from "../constants/airdrop";

const userEligibilityData = (state = {}, action) => {
    if (action.type === SET_USER_ELIGIBILITY_DATA) {
        return action.value
    }

    return state;
};

const userComdexEligibilityData = (state = {}, action) => {
    if (action.type === SET_USER_COMDEX_ELIGIBILITY_DATA) {
        return action.value
    }

    return state;
};

export default combineReducers({
    userEligibilityData,
    userComdexEligibilityData
});