import { combineReducers } from "redux";
import { SET_LOCK_ACTIVE_TAB, SET_TOTAL_ISSUED_VEHARBOR, SET_VESTING_RADIO_VALUE } from "../constants/vesting";

const vestingRadioInput = (state = "t1", action) => {
    if (action.type === SET_VESTING_RADIO_VALUE) {
        return action.data;
    }

    return state;
};
const issuedveHARBOR = (state = 0, action) => {
    if (action.type === SET_TOTAL_ISSUED_VEHARBOR) {
        return action.data;
    }

    return state;
};
const lockActiveKey = (state = false, action) => {
    if (action.type === SET_LOCK_ACTIVE_TAB) {
        return action.data;
    }

    return state;
};



export default combineReducers({
    vestingRadioInput,
    issuedveHARBOR,
    lockActiveKey
});