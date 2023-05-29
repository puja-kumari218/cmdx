import { Button, message, Skeleton, Slider, Spin } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { setVault } from "../../../../actions/account";
import {
  setAmountIn,
  setAmountOut, setAssetIn,
  setAssetOut, setCollateralRatio, setPair
} from "../../../../actions/asset";
import { setExtendedPairVaultListData, setSelectedExtentedPairvault } from "../../../../actions/locker";
import { setOwnerCurrentCollateral } from "../../../../actions/mint";
import { setComplete } from "../../../../actions/swap";
import { SvgIcon } from "../../../../components/common";
import Snack from "../../../../components/common/Snack";
import CustomInput from "../../../../components/CustomInput";
import TooltipIcon from "../../../../components/TooltipIcon";
import { comdex } from "../../../../config/network";
import { ValidateInputNumber } from "../../../../config/_validation";
import { DEFAULT_FEE, DOLLAR_DECIMALS, PRODUCT_ID } from "../../../../constants/common";
import { queryPair, queryPairVault } from "../../../../services/asset/query";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { getTypeURL } from "../../../../services/transaction";
import { queryUserVaultsInfo } from "../../../../services/vault/query";
import {
  amountConversion,
  amountConversionWithComma,
  getAmount,
  getDenomBalance
} from "../../../../utils/coin";
import CustomSkelton from "../../../../components/CustomSkelton";
import { commaSeparator, decimalConversion, marketPrice } from "../../../../utils/number";
import { denomToSymbol, errorMessageMappingParser, iconNameFromDenom, toDecimals } from "../../../../utils/string";
import variables from "../../../../utils/variables";
import "./index.scss";
import PricePool from "./PricePool";
import AssetList from "../../../../config/ibc_assets.json";
import "./index.scss";
import VaultDetails from "./VaultDetails";

const Mint = ({
  lang,
  address,
  pair,
  balances,
  setPair,
  setAmountIn,
  setAmountOut,
  setComplete,
  inAmount,
  outAmount,
  markets,
  collateralRatio,
  setCollateralRatio,
  vault,
  refreshBalance,
  setOwnerCurrentCollateral,
  ownerVaultInfo,
  ownerCurrrentCollateral,
  assetMap,
}) => {
  // pathVaultId ----> extentedPairvaultId
  const { pathVaultId } = useParams();


  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();
  const [debtValidationError, setDebtValidationError] = useState();
  const [loading, setLoading] = useState(false);
  const [currentExtentedVaultdata, setCurrentExtentedVaultdata] = useState();
  const [editType, setEditType] = useState("Mint")

  const dispatch = useDispatch();
  const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData);
  const pairId = selectedExtentedPairVaultListData && selectedExtentedPairVaultListData[0]?.pairId?.toNumber();
  const ownerVaultId = useSelector((state) => state.locker.ownerVaultId);
  const selectedIBCAsset = AssetList?.tokens.filter((item) => (item.coinDenom)?.toLocaleLowerCase() === (denomToSymbol(pair && pair?.denomIn))?.toLowerCase());

  const getOwnerVaultInfo = (ownerVaultId) => {
    queryUserVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      let ownerCollateral = decimalConversion(data?.vaultsInfo?.collateralizationRatio) * 100
      ownerCollateral = Number(ownerCollateral).toFixed(DOLLAR_DECIMALS)
      setOwnerCurrentCollateral(ownerCollateral)
    });
  };

  const getLiquidationPrice = () => {
    // formula = ((Liquidiation Ratio) * (Composite already minted + Composite to be minted) )/ (Quantity of Asset Locked + Quantity of Asset to be Locked)
    let liquidationRatio = Number(decimalConversion(selectedExtentedPairVaultListData[0]?.minCr)) // no converting into %
    let mintedCMST = 0;
    let currentAmountOut = Number(outAmount);
    let lockedAmountOut = 0;
    let currentAmountIn = Number(inAmount);
    let calculatedAmount = (liquidationRatio * ((mintedCMST + currentAmountOut) / (lockedAmountOut + currentAmountIn)))
    calculatedAmount = commaSeparator(Number(calculatedAmount || 0).toFixed(DOLLAR_DECIMALS) || 0);
    if (isNaN(calculatedAmount) || calculatedAmount == "Infinity") {
      return "-"
    }
    return `$${calculatedAmount}`;
  };

  const onChange = (value) => {
    value = toDecimals(value).toString().trim();
    if (ownerVaultId) {
      handleAmountInChangeWhenVaultExist(value)
    } else {
      handleAmountInChange(value);
    }

    if ((selectedIBCAsset && selectedIBCAsset[0]?.coinDenom)?.toLocaleLowerCase() === (denomToSymbol(pair && pair?.denomIn))?.toLowerCase()) {
      setValidationError(
        ValidateInputNumber(value, (collateralAssetBalance / assetMap[pair?.denomIn]?.decimals).toFixed(6))
      );
    }
    else {
      setValidationError(
        ValidateInputNumber(getAmount(value), collateralAssetBalance)
      );
    }
  };

  const onSecondInputChange = (value) => {
    value = toDecimals(value).toString().trim();
    handleAssetOutChange(value)
  }

  const handleAmountInChangeWhenVaultExist = (value) => {
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);
    setValidationError(
      ValidateInputNumber(getAmount(value, assetMap[pair?.denomIn]?.decimals), collateralAssetBalance)
    );

    setAmountIn(value);
    let dataAmount = calculateAmountOut(
      value,
      selectedTokenPrice,
      Number(ownerCurrrentCollateral) / 100,
      marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)
    );
    setDebtValidationError(ValidateInputNumber(dataAmount, "", "", 0))
    setAmountOut(dataAmount);
  }

  const handleAmountInChange = (value) => {
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);
    setValidationError(
      ValidateInputNumber(getAmount(value, assetMap[pair?.denomIn]?.decimals), collateralAssetBalance)
    );

    setAmountIn(value);
    let dataAmount = calculateAmountOut(
      value,
      selectedTokenPrice,
      collateralRatio / 100,
      marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)
    );
    setAmountOut(dataAmount);
    if (!ownerVaultId) {
      setDebtValidationError(
        ValidateInputNumber(getAmount(dataAmount), "", "", debtFloor)
      );
    }

  };

  const collateralAssetBalance = getDenomBalance(balances, pair && pair?.denomIn) || 0;
  // eslint-disable-next-line no-unused-vars
  const stableAssetBalance = getDenomBalance(balances, 'ucmst') || 0;

  const calculateAmountOut = (
    inAmount,
    inAssetPrice,
    ratio,
    amountOutPrice
  ) => {
    const amount = (inAmount * inAssetPrice) / (ratio * amountOutPrice);
    return ((isFinite(amount) && amount) || 0).toFixed(6);
  };

  const selectedTokenPrice = marketPrice(markets, pair?.denomIn, assetMap[pair?.denomIn]?.id);
  const stableTokenPrice = marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id);

  let minCrRatio = decimalConversion(selectedExtentedPairVaultListData[0]?.minCr) * 100;
  minCrRatio = Number(minCrRatio);
  let safeCrRatio = minCrRatio + 70;
  let moderateSafe = Number(minCrRatio) + 30
  let maxCrRatio = Number(minCrRatio) + 130


  const showInAssetValue = () => {
    const oralcePrice = marketPrice(markets, pair?.denomIn, assetMap[pair?.denomIn]?.id);
    const total = oralcePrice * inAmount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const showOutAssetValue = () => {
    const oralcePrice = marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id);
    const total = oralcePrice * outAmount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const handleSliderChange = (value) => {
    let amountOutCalculated;
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);
    setCollateralRatio(value);
    setAmountOut(
      calculateAmountOut(
        inAmount,
        selectedTokenPrice,
        value / 100,
        marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)
      )
    );
    amountOutCalculated = calculateAmountOut(
      inAmount,
      selectedTokenPrice,
      value / 100,
      marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)
    )

    setDebtValidationError(
      ValidateInputNumber(getAmount(amountOutCalculated), "", "", debtFloor)
    );
  };

  const handleMaxClick = () => {
    if (pair && pair?.denomIn === comdex.coinMinimalDenom) {
      return Number(collateralAssetBalance) > DEFAULT_FEE
        ? handleAmountInChange(
          amountConversion(collateralAssetBalance - DEFAULT_FEE)
        )
        : handleAmountInChange();
    } else {
      return handleAmountInChange(amountConversion(collateralAssetBalance, comdex.coinDecimals, assetMap[pair?.denomIn]?.decimals));
    }
  };

  const handleOutMaxClick = () => {
    setAmountOut(calculateWithdrawableAmount())
    setCollateralRatio(minCrRatio)
  };

  const handleAssetOutChange = (value) => {
    setAmountOut(value)
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);
    setDebtValidationError(
      ValidateInputNumber(getAmount(value), "", "", debtFloor)
    );
    let currentCr = collateralRatio;
    let amountOut = value;
    let amountInPrice = Number(selectedTokenPrice)
    let amountIn = inAmount;

    // Calculating amountIn
    let calculateAmountIn = ((currentCr * amountOut) / amountInPrice) / 100;
    // eslint-disable-next-line no-unused-vars
    calculateAmountIn = ((isFinite(calculateAmountIn) && calculateAmountIn) || 0).toFixed(6)

    // Calculating current Collateral Ratio
    let calculateCurrrentCr = ((amountIn * amountInPrice) / (value * stableTokenPrice) * 100);
    calculateCurrrentCr = Number(calculateCurrrentCr).toFixed(DOLLAR_DECIMALS);
    setCollateralRatio(calculateCurrrentCr)
  }

  const resetValues = () => {
    setAmountIn(0);
    setAmountOut(0);
  };

  const handleCreate = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }

    if (ownerVaultId) {
      setInProgress(true);
      message.info("Transaction initiated");
      signAndBroadcastTransaction(
        {
          message: {
            typeUrl: getTypeURL("depositAndDraw"),
            value: {
              from: address,
              appId: Long.fromNumber(PRODUCT_ID),
              extendedPairVaultId: Long.fromNumber(pathVaultId),
              userVaultId: Long.fromNumber(ownerVaultId),
              amount: getAmount(inAmount, assetMap[pair?.denomIn]?.decimals),
            },
          },
          fee: {
            amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
            gas: "2500000",
          },
        },
        address,
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            resetValues();
            return;
          }

          if (result?.code) {
            message.info(errorMessageMappingParser(result?.rawLog));
            resetValues();
            return;
          }

          setComplete(true);
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
      return;
    } else {
      setInProgress(true);
      message.info("Transaction initiated");
      signAndBroadcastTransaction(
        {
          message: {
            typeUrl: getTypeURL("create"),
            value: {
              from: address,
              appId: Long.fromNumber(PRODUCT_ID),
              extendedPairVaultId: Long.fromNumber(pathVaultId),
              amountIn: getAmount(inAmount, assetMap[pair?.denomIn]?.decimals),
              amountOut: getAmount(outAmount, assetMap[pair?.denomOut]?.decimals),
            },
          },
          fee: {
            amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
            gas: "2500000",
          },
        },
        address,
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            resetValues();
            return;
          }

          if (result?.code) {
            message.info(errorMessageMappingParser(result?.rawLog));
            resetValues();
            return;
          }

          setComplete(true);
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
    }
  };

  const fetchQueryPairValut = (pairVaultId) => {
    setLoading(true)
    queryPairVault(pairVaultId, (error, data) => {
      if (error) {
        message.error(error);
        setLoading(false)
        return;
      }
      setCurrentExtentedVaultdata(data?.pairVault)
      dispatch(setExtendedPairVaultListData(data?.pairVault))
      dispatch(setSelectedExtentedPairvault(data?.pairVault))
      setLoading(false)
    })
  }

  const getAssetDataByPairId = (pairId) => {
    queryPair(pairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setPair(data?.pairInfo)
    })
  }

  const calculateWithdrawableAmount = () => {
    let amountIn = Number(inAmount);
    let amountInPrice = Number(selectedTokenPrice);
    let minCr = minCrRatio;
    let calculateWithdrawable = Number(((amountIn * amountInPrice) / minCr) * 100).toFixed(DOLLAR_DECIMALS)
    return calculateWithdrawable;
  }

  calculateWithdrawableAmount()

  const calculatedDrawdownAmount = () => {
    let cmstToBeMint = Number(outAmount);
    let drawDownFee = (decimalConversion(selectedExtentedPairVaultListData?.[0]?.drawDownFee) * 100).toFixed(DOLLAR_DECIMALS);
    let calculatedDrawDownAmount = Number((cmstToBeMint * drawDownFee) / 100).toFixed(comdex.coinDecimals);
    return calculatedDrawDownAmount;
  }

  useEffect(() => {
    calculatedDrawdownAmount();
  }, [outAmount, selectedExtentedPairVaultListData])

  useEffect(() => {
    if (ownerVaultId) {
      setEditType("Deposit And Draw")
    }
    else {
      setEditType("Mint")
    }
  }, [ownerVaultId])

  useEffect(() => {
    if (ownerVaultInfo?.id) {
      getOwnerVaultInfo(ownerVaultInfo?.id)
    }
    else {
      setOwnerCurrentCollateral(0)
    }
  }, [ownerVaultInfo, refreshBalance])

  useEffect(() => {
    if (!ownerVaultId) {
      setOwnerCurrentCollateral(0)
    }
  }, [ownerVaultId, ownerVaultInfo])

  useEffect(() => {
    resetValues()
    fetchQueryPairValut(pathVaultId);
    if (pairId) {
      getAssetDataByPairId(pairId);
    }
  }, [address, pairId, refreshBalance])

  useEffect(() => {
    resetValues();
  }, []);

  useEffect(() => {
    setCollateralRatio(safeCrRatio);
  }, [safeCrRatio]);


  const marks = {
    [minCrRatio + 5]: `Min`,
    [moderateSafe]: `Moderate`,
    [safeCrRatio]: `Safe`,
    [maxCrRatio]: "Max"
  };
  // const marks = {
  //   0: "0%",
  //   [minCrRatio]: `Min`,
  //   [safeCrRatio]: `Safe`,
  //   500: "500%"
  // };

  const tipFormatter = (value) => {
    if (value < moderateSafe) {
      return ` Very Risky at ${value}%`;
    }
    if (value <= safeCrRatio) {
      return ` Moderate Risky at ${value}%`;
    }
    if (value > safeCrRatio) {
      return ` Safe at ${value}%`;
    }
  };

  if (loading) {
    return <div className="spinner"><Spin /></div>
  }

  return (
    <>
      <div className="details-wrapper">
        <div className="details-left farm-content-card earn-deposite-card vault-mint-card">
          <div className="mint-title">Configure Your Vault</div>
          <div className="assets-select-card">
            <div className="assets-left">
              <label className="leftlabel">
                Deposit  <TooltipIcon text="Asset that will be locked as collateral in the vault" />
              </label>
              <div className="assets-select-wrapper">
                {/* Icon Container Start  */}
                <div className="farm-asset-icon-container">
                  <div className="select-inner">
                    <div className="svg-icon">
                      <div className="svg-icon-inner mint-svg-icon-inner">
                        {pair && pair.denomIn ? <SvgIcon name={pair && pair.denomIn ? iconNameFromDenom(pair && pair?.denomIn) : ""} /> : <span className="mint-custom-skelton" ><CustomSkelton /></span>}
                        <span> {pair && pair.denomIn ? denomToSymbol(pair && pair?.denomIn) : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Icon Container End  */}
              </div>
            </div>
            <div className="assets-right">
              <div className="label-right">
                Available
                <span className="ml-1">
                  {amountConversionWithComma(collateralAssetBalance, comdex.coinDecimals, assetMap[pair?.denomIn]?.decimals)} {" "}
                  {denomToSymbol(pair && pair?.denomIn)}
                </span>
                <div className="maxhalf">
                  <Button
                    className="active"
                    onClick={() =>
                      handleMaxClick()
                    }
                  >
                    max
                  </Button>
                </div>
              </div>
              <div className="input-select">
                <CustomInput
                  value={inAmount}
                  onChange={(event) =>
                    onChange(event.target.value)
                  }
                  validationError={validationError}
                />
                <small>$ {showInAssetValue()}</small>
              </div>
            </div>
          </div>

          <div className={ownerVaultId ? "assets-select-card  vault-exist-margin" : "assets-select-card mt-4"}>
            <div className="assets-left">
              <label className="leftlabel">
                Withdraw <TooltipIcon text="CMST being borrowed from the vault based on the collateral value" />
              </label>
              <div className="assets-select-wrapper">
                {/* Icon Container Start  */}
                <div className="farm-asset-icon-container">
                  <div className="select-inner">
                    <div className="svg-icon">
                      <div className="svg-icon-inner mint-svg-icon-inner">
                        <SvgIcon name={iconNameFromDenom("ucmst")} />{" "}
                        <span> CMST</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Icon Container End  */}
              </div>
            </div>
            <div className="assets-right">

              {!ownerVaultId && <div className="label-right">
                Withdrawable
                <span className="ml-1">
                  {calculateWithdrawableAmount()} {denomToSymbol(pair && pair?.denomOut)}
                </span>
                <div className="maxhalf">
                  <Button
                    className="active"
                    onClick={() => {
                      handleOutMaxClick()
                    }
                    }
                  >
                    max
                  </Button>
                </div>
              </div>
              }
              <div className="input-select">
                <CustomInput
                  value={outAmount}
                  onChange={(e) => {
                    onSecondInputChange(e.target.value)
                  }}
                  validationError={debtValidationError}
                  disabled={ownerVaultId ? true : false}
                />
                <small>$ {showOutAssetValue()}</small>
              </div>
            </div>
          </div>

          {!ownerVaultId && <div className="Interest-rate-container mt-4">
            <div className="slider-numbers mt-4 mint-slider-number">
              <Slider
                className={
                  "comdex-slider borrow-comdex-slider " +
                  (collateralRatio <= minCrRatio
                    ? " red-track"
                    : collateralRatio < moderateSafe
                      ? " red-track"
                      : collateralRatio < safeCrRatio
                        ? " orange-track"
                        : collateralRatio >= safeCrRatio
                          ? " green-track"
                          : " ")
                }
                defaultValue={collateralRatio}
                marks={marks}
                value={collateralRatio}
                max={maxCrRatio}
                onChange={handleSliderChange}
                min={minCrRatio + 5}
                // tooltip={{ open: false }}
                tooltip={{
                  formatter: tipFormatter
                }}
              />
              {/* collateral container  */}
              <div className="slider-input-box-container mt-2">
                <div className="title">
                  <div className="title">Set Collateral Ratio</div>
                </div>
                <div className="input-box-container">
                  <CustomInput
                    defaultValue={collateralRatio}
                    onChange={(event) => {
                      handleSliderChange(event.target?.value);
                    }}
                    placeholder="0"
                    value={collateralRatio}
                  />
                  <span className="collateral-percentage">%</span>
                </div>

              </div>
              {/* Liquidation Container  */}
              <div className="slider-input-box-container mt-2">
                <div className="title">
                  <div className="title">Expected Liquidation Price</div>
                </div>
                <div className="input-box-container">
                  <div className="liquidation-price">
                    {getLiquidationPrice() || "-"}
                  </div>
                </div>

              </div>
              {/* Calculated Drawdown Container  */}
              <div className="slider-input-box-container mt-2">
                <div className="title">
                  <div className="title">Calculated Drawdown Amount</div>
                </div>
                <div className="input-box-container">
                  <div className="liquidation-price">
                    {calculatedDrawdownAmount() || 0} CMST
                  </div>
                </div>

              </div>

              {/* CMST user Will receive Container  */}
              <div className="slider-input-box-container mt-2">
                <div className="title">
                  <div className="title">CMST User will Receive</div>
                </div>
                <div className="input-box-container">
                  <div className="liquidation-price">
                    {Number(Number(outAmount) - Number(calculatedDrawdownAmount() || 0)).toFixed(comdex.coinDecimals)} CMST
                  </div>
                </div>

              </div>
            </div>
          </div>
          }

          {/* <Info /> */}
          <div className="assets PoolSelect-btn">
            <div className="assets-form-btn text-center  mb-2">
              <Button
                loading={inProgress}
                disabled={
                  inProgress ||
                  !pair ||
                  !Number(inAmount) ||
                  !Number(outAmount) ||
                  validationError?.message ||
                  debtValidationError?.message ||
                  Number(collateralRatio) < minCrRatio
                }
                loading={inProgress}
                type="primary"
                className={ownerVaultId ? "btn-filled mt-4" : "btn-filled"}
                onClick={() => handleCreate()}
              >
                {editType}
              </Button>
            </div>
          </div>
        </div>

        <div className="details-right mint-detail-stats-container">
          <PricePool />
          <VaultDetails item={currentExtentedVaultdata} />
        </div>
      </div>
    </>
  );
};

Mint.prototype = {
  lang: PropTypes.string.isRequired,
  setAmountIn: PropTypes.func.isRequired,
  setAmountOut: PropTypes.func.isRequired,
  setAssetIn: PropTypes.func.isRequired,
  setAssetOut: PropTypes.func.isRequired,
  setCollateralRatio: PropTypes.func.isRequired,
  setComplete: PropTypes.func.isRequired,
  setPair: PropTypes.func.isRequired,
  setVault: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  collateralRatio: PropTypes.number,
  inAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  markets: PropTypes.object,
  outAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pair: PropTypes.shape({
    denomIn: PropTypes.string,
    denomOut: PropTypes.string,
  }),
  pairs: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
        liquidationRatio: PropTypes.string,
        id: PropTypes.shape({
          high: PropTypes.number,
          low: PropTypes.number,
          unsigned: PropTypes.bool,
        }),
      })
    ),
  }),
  refreshBalance: PropTypes.number.isRequired,
  vault: PropTypes.shape({
    collateral: PropTypes.shape({
      denom: PropTypes.string,
    }),
    debt: PropTypes.shape({
      denom: PropTypes.string,
    }),
    id: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
  ownerVaultInfo: PropTypes.array,
  ownerCurrrentCollateral: PropTypes.number.isRequired,
  ownerVaultId: PropTypes.string,
  vaults: PropTypes.arrayOf(
    PropTypes.shape({
      collateral: PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      }),
      debt: PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      }),
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
    })
  ),
}
const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pair: state.asset.pair,
    pairs: state.asset.pairs,
    inAmount: state.asset.inAmount,
    outAmount: state.asset.outAmount,
    markets: state.oracle.market,
    collateralRatio: state.asset.collateralRatio,
    balances: state.account.balances.list,
    vaults: state.account.vaults.list,
    vault: state.account.vault,
    refreshBalance: state.account.refreshBalance,
    ownerVaultInfo: state.locker.ownerVaultInfo,
    ownerCurrrentCollateral: state.mint.ownerCurrrentCollateral,
    ownerVaultId: state.locker.ownerVaultId,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  setPair,
  setVault,
  setComplete,
  setAssetIn,
  setAssetOut,
  setAmountIn,
  setAmountOut,
  setCollateralRatio,
  setOwnerCurrentCollateral,
};
export default connect(stateToProps, actionsToProps)(Mint);
