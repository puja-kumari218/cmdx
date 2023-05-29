import { Button, message } from "antd";
import Long from "long";
import "./index.scss";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from "../../../components/common";
import CustomInput from "../../../components/CustomInput";
import TooltipIcon from "../../../components/TooltipIcon";
import { ValidateInputNumber } from "../../../config/_validation";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from "../../../utils/coin";
import { iconNameFromDenom, toDecimals } from "../../../utils/string";
import variables from "../../../utils/variables";
import { setAmountIn, setAssets, setPair } from "../../../actions/asset";
import {
  setWhiteListedAssets,
  setAllWhiteListedAssets,
  setIsLockerExist,
  setOwnerVaultInfo,
  setCollectorData
} from "../../../actions/locker";
import "./index.scss";
import { queryAssets } from "../../../services/asset/query";
import {
  DEFAULT_FEE,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS,
  PRODUCT_ID,
} from "../../../constants/common";
import {
  queryLockerWhiteListedAssetByProductId,
  queryUserLockerByProductAssetId,
} from "../../../services/locker/query";
import Snack from "../../../components/common/Snack";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { defaultFee } from "../../../services/transaction";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { queryCollectorInformation } from "../../../services/collector";
import { decimalConversion } from "../../../utils/number";
import CustomSkelton from "../../../components/CustomSkelton";

const Deposit = ({
  lang,
  balances,
  address,
  setAssets,
  assets,
  refreshBalance,
  setWhiteListedAssets,
  whiteListedAsset,
  ownerLockerInfo,
  setOwnerVaultInfo,
  setCollectorData
}) => {
  const dispatch = useDispatch();
  const inAmount = useSelector((state) => state.asset.inAmount);
  const isLockerExist = useSelector((state) => state.locker.isLockerExist);

  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValidationError, setInputValidationError] = useState();
  const [collectorInfo, setCollectorInfo] = useState();

  const whiteListedAssetData = [];
  const resetValues = () => {
    dispatch(setAmountIn(0));
  };

  const getAssetDenom = () => {
    assets?.map((item) => {
      if (item?.id?.toNumber() === whiteListedAsset[0]?.toNumber()) {
        whiteListedAssetData.push(item);
      }
    });
  };

  const handleFirstInputChange = (value) => {
    value = toDecimals(value).toString().trim();
    setInputValidationError(
      ValidateInputNumber(
        Number(getAmount(value)),
        AvailableAssetBalance,
        "macro"
      )
    );
    dispatch(setAmountIn(value));
  };
  const showInDollarValue = () => {
    const total = inAmount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  useEffect(() => {
    resetValues();
    fetchAssets(
      (DEFAULT_PAGE_NUMBER - 1) * (DEFAULT_PAGE_SIZE * 2),
      (DEFAULT_PAGE_SIZE * 2),
      true,
      false
    );
    fetchWhiteListedAssetByid(PRODUCT_ID);
  }, [address]);

  useEffect(() => {
    fetchCollectorStats();
  }, [whiteListedAsset]);

  useEffect(() => {
    fetchOwnerLockerExistByAssetId(PRODUCT_ID, whiteListedAssetId, address);
  }, [whiteListedAsset, refreshBalance])


  const fetchAssets = (offset, limit, countTotal, reverse) => {
    setInProgress(true);
    setLoading(true);
    queryAssets(offset, limit, countTotal, reverse, (error, data) => {
      setInProgress(false);
      setLoading(false);
      if (error) {
        message.error(error);
        return;
      }
      setAssets(data.assets, data.pagination);
    });
  };

  const fetchWhiteListedAssetByid = (productId) => {
    setInProgress(true);
    setLoading(true);
    queryLockerWhiteListedAssetByProductId(productId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setWhiteListedAssets(data?.assetIds);
      setLoading(false);
    });
  };

  const fetchOwnerLockerExistByAssetId = (productId, assetId, address) => {
    queryUserLockerByProductAssetId(
      productId,
      assetId,
      address,
      (error, data) => {
        if (error) {
          message.error(error);
          return;
        }
        let lockerExist = data?.lockerInfo?.lockerId?.toNumber();
        setOwnerVaultInfo(data?.lockerInfo);
        if (lockerExist) {
          dispatch(setIsLockerExist(true));
        } else {
          dispatch(setIsLockerExist(false));
        }
      }
    );
  };
  const fetchCollectorStats = () => {
    queryCollectorInformation((error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      setCollectorData(result?.collectorLookup[0])
      setCollectorInfo(result?.collectorLookup[0]);
    });
  };

  getAssetDenom();

  const AvailableAssetBalance =
    getDenomBalance(balances, whiteListedAssetData[0]?.denom) || 0;
  const whiteListedAssetId = whiteListedAsset[0]?.toNumber();
  const lockerId = ownerLockerInfo?.lockerId;

  const handleInputMax = () => {
    if (Number(AvailableAssetBalance)) {
      return dispatch(
        setAmountIn(amountConversion(AvailableAssetBalance))
      );
    } else {
      return null;
    }
  };

  const handleSubmitCreateLocker = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }
    setInProgress(true);
    message.info("Transaction initiated");
    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.locker.v1beta1.MsgCreateLockerRequest",
          value: {
            depositor: address,
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

  const handleSubmitAssetDepositLocker = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }
    setInProgress(true);
    message.info("Transaction initiated");
    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.locker.v1beta1.MsgDepositAssetRequest",
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
  return (
    <>
      <Col>
        <div className="farm-content-card earn-deposite-card earn-main-deposite">
          <div className="locker-title">Locker</div>
          <div className="assets-select-card  ">
            <div className="assets-left">
              <label className="leftlabel">
                Deposit <TooltipIcon text="Deposit Composite in locker to earn interest compounded per block" />
              </label>
              <Row>
                <Col>
                  <div className="assets-select-wrapper">
                    {/* For Single Asset */}
                    {loading ? <CustomSkelton /> : null}
                    {whiteListedAssetData &&
                      whiteListedAssetData.map((item, index) => {
                        return (
                          <React.Fragment key={index}>
                            {loading ? null : (
                              <div className="farm-asset-icon-container">
                                <div className="select-inner">
                                  <div className="svg-icon">
                                    <div className="svg-icon-inner">
                                      <SvgIcon
                                        name={iconNameFromDenom(item?.denom)}
                                      />
                                      <span
                                        style={{ textTransform: "uppercase" }}
                                      >
                                        {" "}
                                        {item?.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </div>
                </Col>
              </Row>
            </div>
            <div className="assets-right">
              <div className="label-right">
                Available
                <span className="ml-1">
                  {amountConversionWithComma(AvailableAssetBalance)} {denomConversion(whiteListedAssetData && whiteListedAssetData[0]?.denom)}
                </span>
                <div className="maxhalf">
                  <Button className="active" onClick={() => handleInputMax()}>
                    Max
                  </Button>
                </div>
              </div>
              <div className="input-select">
                <CustomInput
                  value={inAmount}
                  onChange={(event) => {
                    handleFirstInputChange(event.target.value);
                  }}
                  validationError={inputValidationError}
                // disabled={true}
                />
                <small>{showInDollarValue()}</small>
              </div>
            </div>
          </div>

          <div className="interest-rate-container mt-4">
            <Row>
              <div className="title">Current Reward Rate</div>
              <div className="value"> {collectorInfo?.lockerSavingRate
                ? Number(
                  decimalConversion(collectorInfo?.lockerSavingRate) * 100
                ).toFixed(DOLLAR_DECIMALS)
                : Number().toFixed(DOLLAR_DECIMALS)}%</div>
            </Row>
          </div>

          <div className="assets PoolSelect-btn">
            <div className="assets-form-btn text-center  mb-2">
              <Button
                loading={inProgress}
                type="primary"
                className="btn-filled"
                disabled={
                  inProgress
                  || !Number(inAmount) ||
                  inputValidationError?.message
                }
                onClick={() => {
                  if (isLockerExist) {
                    handleSubmitAssetDepositLocker();
                  } else {
                    handleSubmitCreateLocker();
                  }
                }}
              >
                {isLockerExist ? "Deposit " : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </Col>
    </>
  );
};

Deposit.propTypes = {
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
  allWhiteListedAssets: PropTypes.arrayOf(
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
  demandCoin: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    denom: PropTypes.string,
  }),
  refreshBalance: PropTypes.number.isRequired,
  ownerLockerInfo: PropTypes.string,
};
const stateToProps = (state) => {
  return {
    address: state.account.address,
    lang: state.language,
    balances: state.account.balances.list,
    pair: state.asset.pair,
    assets: state.asset._.list,
    allWhiteListedAssets: state.locker._.list,
    whiteListedAsset: state.locker.whiteListedAssetById.list,
    refreshBalance: state.account.refreshBalance,
    ownerLockerInfo: state.locker.ownerVaultInfo,
  };
};

const actionsToProps = {
  setPair,
  setAssets,
  setAllWhiteListedAssets,
  setWhiteListedAssets,
  setOwnerVaultInfo,
  setCollectorData,
};
export default connect(stateToProps, actionsToProps)(Deposit);
