import { Button, message, Slider } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Col } from "../../../components/common";
import CustomInput from "../../../components/CustomInput";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
} from "../../../utils/coin";
import { toDecimals } from "../../../utils/string";
import variables from "../../../utils/variables";
import "./index.scss";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ValidateInputNumber } from "../../../config/_validation";
import { setAmountIn, setAssets, setPair } from "../../../actions/asset";
import { queryUserLockerByProductAssetId } from "../../../services/locker/query";
import {
  setIsLockerExist,
  setUserLockedValue,
  setSliderTooltipVisible,
  setOwnerVaultInfo,
} from "../../../actions/locker";
import { defaultFee } from "../../../services/transaction";
import Long from "long";
import { signAndBroadcastTransaction } from "../../../services/helper";
import Snack from "../../../components/common/Snack";
import { DEFAULT_FEE, DOLLAR_DECIMALS, PRODUCT_ID } from "../../../constants/common";
import TooltipIcon from "../../../components/TooltipIcon";

const Withdraw = ({
  lang,
  address,
  assets,
  refreshBalance,
  userLockedAmountInLocker,
  setUserLockedValue,
  sliderTooltipVisible,
  setSliderTooltipVisible,
  whiteListedAsset,
  ownerLockerInfo,
  setOwnerVaultInfo,
}) => {
  const dispatch = useDispatch();
  const inAmount = useSelector((state) => state.asset.inAmount);
  const isLockerExist = useSelector((state) => state.locker.isLockerExist);
  const [inProgress, setInProgress] = useState(false);
  const [inProgressCal, setInProgressCal] = useState(false);

  const [inputValidationError, setInputValidationError] = useState();
  const [userDeposite, setuserDeposite] = useState();
  const [reward, setReward] = useState();
  const [sliderPercentage, setsliderPercentage] = useState(0);
  const [sliderValue, setSliderValue] = useState();

  const whiteListedAssetData = [];
  const resetValues = () => {
    setSliderValue(0)
    dispatch(setAmountIn(0));
  };
  const getAssetDenom = () => {
    assets?.map((item) => {
      if (item?.id?.toNumber() === whiteListedAsset[0]?.toNumber()) {
        whiteListedAssetData.push(item);
      }
    });
  };

  const handleInputChange = (value) => {
    value = toDecimals(value).toString().trim();
    setInputValidationError(
      ValidateInputNumber(
        Number(getAmount(value)),
        userLockedAmountInLocker,
        "macro"
      )
    );
    let calculatedSliderValue = (value / userDeposite) * 100
    setSliderValue(calculatedSliderValue)
    dispatch(setAmountIn(value));
    calculatedSliderValue = Math.floor(calculatedSliderValue)
    setsliderPercentage(calculatedSliderValue)
  };

  const handleSliderChange = (value) => {
    setsliderPercentage(value)
    setSliderValue(value)
    if (value === userDeposite) {
      dispatch(setAmountIn(userDeposite));
      return
    }
    else {
      let calcutatedValue = (value / 100) * userDeposite;
      dispatch(setAmountIn(calcutatedValue));
    }
  };

  const formatter = () => {

    if (sliderPercentage > 100) {
      return `${100}%`
    }
    else {
      return `${sliderPercentage}%`
    }
  };

  useEffect(() => {
    resetValues();
    fetchOwnerLockerExistByAssetId(PRODUCT_ID, whiteListedAssetId, address);
  }, [address, userDeposite, refreshBalance]);

  const whiteListedAssetId = whiteListedAsset[0]?.toNumber();
  const lockerId = ownerLockerInfo?.lockerId;
  const returnsAccumulated = amountConversion(ownerLockerInfo?.returnsAccumulated || 0);
  const userBalanceInLocker = amountConversionWithComma(ownerLockerInfo?.netBalance || 0);

  const handleMaxClick = () => {
    let amount = amountConversion(ownerLockerInfo?.netBalance || 0)
    dispatch(setAmountIn(amount));
    setSliderValue(100)
  }

  const fetchOwnerLockerExistByAssetId = (
    productId = PRODUCT_ID,
    whiteListedAssetId,
    address
  ) => {
    queryUserLockerByProductAssetId(
      productId,
      whiteListedAssetId,
      address,
      (error, data) => {
        if (error) {
          message.error(error);
          return;
        }
        let balance;
        balance = (data?.lockerInfo?.netBalance || "0") / 1000000;
        setOwnerVaultInfo(data?.lockerInfo);
        setReward(data?.lockerInfo?.returnsAccumulated);
        setuserDeposite(balance);
        setUserLockedValue(data?.lockerInfo?.netBalance || "0");
        let lockerExist = data?.lockerInfo?.lockerId?.toNumber();
        if (lockerExist > 0) {
          dispatch(setIsLockerExist(true));
        } else {
          dispatch(setIsLockerExist(false));
        }
        setInProgress(false);
      }
    );
  };

  const handleSubmitAssetWithdrawLocker = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }
    setInProgress(true);
    message.info("Transaction initiated");
    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.locker.v1beta1.MsgWithdrawAssetRequest",
          value: {
            depositor: address,
            lockerId: lockerId,
            amount: getAmount(inAmount),
            assetId: Long.fromNumber(whiteListedAssetId),
            appId: Long.fromNumber(PRODUCT_ID),
          },
        },
        fee: defaultFee(),
      },
      address,
      (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
        resetValues();
        dispatch({
          type: "BALANCE_REFRESH_SET",
          value: refreshBalance + 1,
        });
      }
    );
  };

  const submitLockerInterestCalculate = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }
    setInProgressCal(true);
    message.info("Transaction initiated");
    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.locker.v1beta1.MsgLockerRewardCalcRequest",
          value: {
            from: address,
            appId: Long.fromNumber(PRODUCT_ID),
            lockerId: lockerId,
          },
        },
        fee: {
          amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
          gas: "2500000",
        },
      },
      address,
      (error, result) => {
        setInProgressCal(false);
        if (error) {
          console.log(error);
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
        dispatch({
          type: "BALANCE_REFRESH_SET",
          value: refreshBalance + 1,
        });
      }
    );

  }

  const marks = {
    0: "0%",
    100: "100%",
  };
  getAssetDenom();

  return (
    <>
      <Col>
        <div className="farm-content-card earn-deposite-card earn-main-deposite locker-withdraw">
          <div className="withdraw-title">Locker</div>
          <div className="withdraw-main-container">
            <div className="withdraw-content-container">
              <div className="withdraw-stats-container">
                <div className="withdraw-stats">
                  <div className="stats-title">Balance</div>
                  <div className="stats-value flex">
                    {userBalanceInLocker} {" "}
                    {denomConversion("ucmst")} {" "}
                    <span className="maxhalf">
                      <Button
                        className="active"
                        onClick={() =>
                          handleMaxClick()
                        }
                      >
                        max
                      </Button>
                    </span>
                  </div>

                  <div className="reward-claim-main-container-btn mt-1">
                    <div className="reward-claim-btn-container">
                      <span className="maxhalf claim-tx-btn">
                        <Button
                          className="btn-filled active"
                          onClick={() => submitLockerInterestCalculate()}
                          type="primary"
                          loading={inProgressCal}
                          disabled={inProgress || inProgressCal}
                        >
                          Fetch Rewards
                        </Button>
                      </span>
                    </div>
                  </div>

                </div>
                <div className="withdraw-stats withdraw-stats-right">
                  <div className="stats-title">Rewards Accumulated <TooltipIcon text="Rewards earned on locked CMST" /></div>
                  <div className="stats-value">
                    {returnsAccumulated || 0}{" "}
                    {denomConversion(whiteListedAssetData[0]?.denom)}{" "}
                  </div>
                </div>
              </div>
              <div className="available-container">
                <div className="available-title">Amount to Withdraw</div>
                <div className="available-input">
                  <div className="input-select ">
                    <CustomInput
                      className="ant-input"
                      value={inAmount}
                      placeholder="0.00"
                      onChange={(event) =>
                        handleInputChange(event.target.value)
                      }
                      validationError={inputValidationError}
                    />
                    <span className="denom-name">CMST</span>
                  </div>
                </div>
              </div>
              <div className="withdraw-slider">
                <div className="slider-numbers mt-3">
                  <Slider
                    className={"comdex-slider "}
                    marks={marks}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    min={0}
                    tooltip={{ tooltip: formatter }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="assets PoolSelect-btn">
            <div className="assets-form-btn text-center  mb-2">
              <Button
                loading={inProgress}
                disabled={
                  !isLockerExist ||
                  !inAmount ||
                  inAmount <= 0 ||
                  inProgress ||
                  inProgressCal ||
                  inputValidationError?.message
                }
                type="primary"
                className="btn-filled"
                onClick={() => handleSubmitAssetWithdrawLocker()}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </Col>
    </>
  );
};

Withdraw.propTypes = {
  address: PropTypes.string.isRequired,
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        low: PropTypes.number,
        high: PropTypes.number,
        inSigned: PropTypes.number,
      }),
      name: PropTypes.string.isRequired,
      denom: PropTypes.string.isRequired,
      decimals: PropTypes.shape({
        low: PropTypes.number,
        high: PropTypes.number,
        inSigned: PropTypes.number,
      }),
    })
  ),
  whiteListedAsset: PropTypes.arrayOf(
    PropTypes.shape({
      list: PropTypes.shape({
        id: PropTypes.shape({
          low: PropTypes.number,
          high: PropTypes.number,
          inSigned: PropTypes.number,
        }),
      }),
    })
  ),
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  refreshBalance: PropTypes.number.isRequired,
  userLockedAmountInLocker: PropTypes.string.isRequired,
  sliderTooltipVisible: PropTypes.bool.isRequired,
  ownerLockerInfo: PropTypes.object,
};
const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    assets: state.asset._.list,
    balances: state.account.balances.list,
    pair: state.asset.pair,
    refreshBalance: state.account.refreshBalance,
    userLockedAmountInLocker: state.locker.userLockedAmountInLocker,
    sliderTooltipVisible: state.locker.sliderTooltipVisible,
    whiteListedAsset: state.locker.whiteListedAssetById.list,
    ownerLockerInfo: state.locker.ownerVaultInfo,
  };
};
const actionsToProps = {
  setPair,
  setUserLockedValue,
  setAssets,
  setSliderTooltipVisible,
  setOwnerVaultInfo,
};

export default connect(stateToProps, actionsToProps)(Withdraw);
