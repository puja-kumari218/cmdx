import {
  SET_ALL_WHITELISTED_ASSET,
  SET_COLLECTOR_DATA,
  SET_CURRENT_PAIR_ID,
  SET_ESTIMATED_LIQUIDATION_PRICE,
  SET_EXTENDED_PAIR_ID,
  SET_EXTENDED_PAIR_VAULT_DATA_BY_ID,
  SET_ISLOCKER_EXIST,
  SET_LOCKER_DEFAULT_SELECT_TAB,
  SET_OWNER_VAULT_ID,
  SET_OWNER_VAULT_INFO,
  SET_SELECT_EXTENTED_PAIR_VAULT,
  SET_SLIDER_TOOLTIP_VISIBLE,
  SET_USER_LOCKED_VALUE,
  SET_WHITELISTED_ASSET,
} from "../constants/locker";
import { combineReducers } from "redux";

const _ = (
  state = {
    list: [],
    inProgress: false,
  },
  action
) => {
  if (action.type === SET_ALL_WHITELISTED_ASSET) {
    return {
      ...state,
      list: action.list,
    };
  }

  return state;
};
const whiteListedAssetById = (
  state = {
    list: [],
    inProgress: false,
  },
  action
) => {
  if (action.type === SET_WHITELISTED_ASSET) {
    return {
      ...state,
      list: action.list,
    };
  }

  return state;
};
const isLockerExist = (state = "false", action) => {
  if (action.type === SET_ISLOCKER_EXIST) {
    return action.value;
  }
  return state;
};
const userLockedAmountInLocker = (state = "0", action) => {
  if (action.type === SET_USER_LOCKED_VALUE) {
    return action.value;
  }

  return state;
};
const sliderTooltipVisible = (state = false, action) => {
  if (action.type === SET_SLIDER_TOOLTIP_VISIBLE) {
    return action.value;
  }
  return state;
};
const extenedPairVaultList = (state = [], action) => {
  if (action.type === SET_EXTENDED_PAIR_ID) {
    return [action.value];
  }
  return state;
};
const extenedPairVaultListData = (state = [], action) => {
  if (action.type === SET_EXTENDED_PAIR_VAULT_DATA_BY_ID) {
    return [action.value];
  }
  return state;
};
const selectedExtentedPairVault = (state = [], action) => {
  if (action.type === SET_SELECT_EXTENTED_PAIR_VAULT) {
    return [action.value];
  }
  return state;
};
const currentPairId = (state = "", action) => {
  if (action.type === SET_CURRENT_PAIR_ID) {
    return action.value;
  }
  return state;
};
const ownerVaultId = (state = "", action) => {
  if (action.type === SET_OWNER_VAULT_ID) {
    return action.value;
  }
  return state;
};
const ownerVaultInfo = (state = "", action) => {
  if (action.type === SET_OWNER_VAULT_INFO) {
    return action.value;
  }
  return state;
};

const estimatedLiquidationPrice = (state = 0, action) => {
  if (action.type === SET_ESTIMATED_LIQUIDATION_PRICE) {
    return action.value;
  }
  return state;
};
const collectorData = (state = [], action) => {
  if (action.type === SET_COLLECTOR_DATA) {
    return [action.value];
  }
  return state;
};
const lockerDefaultSelectTab = (state = "1", action) => {
  if (action.type === SET_LOCKER_DEFAULT_SELECT_TAB) {
    return action.value;
  }
  return state;
};

export default combineReducers({
  _,
  whiteListedAssetById,
  isLockerExist,
  userLockedAmountInLocker,
  sliderTooltipVisible,
  extenedPairVaultList,
  extenedPairVaultListData,
  selectedExtentedPairVault,
  currentPairId,
  ownerVaultId,
  ownerVaultInfo,
  estimatedLiquidationPrice,
  collectorData,
  lockerDefaultSelectTab
});
