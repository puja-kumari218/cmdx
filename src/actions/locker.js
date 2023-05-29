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

export const setAllWhiteListedAssets = (list) => {
  return {
    type: SET_ALL_WHITELISTED_ASSET,
    list,
  };
};
export const setWhiteListedAssets = (list) => {
  return {
    type: SET_WHITELISTED_ASSET,
    list,
  };
};
export const setIsLockerExist = (value) => {
  return {
    type: SET_ISLOCKER_EXIST,
    value,
  };
};
export const setUserLockedValue = (value) => {
  return {
    type: SET_USER_LOCKED_VALUE,
    value,
  };
};
export const setSliderTooltipVisible = (value) => {
  return {
    type: SET_SLIDER_TOOLTIP_VISIBLE,
    value,
  };
};

export const setAllExtendedPair = (value) => {
  return {
    type: SET_EXTENDED_PAIR_ID,
    value,
  };
};
export const setExtendedPairVaultListData = (value) => {
  return {
    type: SET_EXTENDED_PAIR_VAULT_DATA_BY_ID,
    value,
  };
};
export const setSelectedExtentedPairvault = (value) => {
  return {
    type: SET_SELECT_EXTENTED_PAIR_VAULT,
    value,
  };
};
export const setCurrentPairID = (value) => {
  return {
    type: SET_CURRENT_PAIR_ID,
    value,
  };
};
export const setOwnerVaultId = (value) => {
  return {
    type: SET_OWNER_VAULT_ID,
    value,
  };
};
export const setOwnerVaultInfo = (value) => {
  return {
    type: SET_OWNER_VAULT_INFO,
    value,
  };
};

export const setEstimatedLiquidationPrice = (value) => {
  return {
    type: SET_ESTIMATED_LIQUIDATION_PRICE,
    value,
  };
};
export const setCollectorData = (value) => {
  return {
    type: SET_COLLECTOR_DATA,
    value,
  };
};
export const setLockerDefaultSelectTab = (value) => {
  return {
    type: SET_LOCKER_DEFAULT_SELECT_TAB,
    value,
  };
};
