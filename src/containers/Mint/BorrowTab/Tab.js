import { Button, message, Slider } from "antd";
import Long from "long";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, SvgIcon } from "../../../components/common";
import Snack from "../../../components/common/Snack";
import CustomInput from "../../../components/CustomInput";
import CustomSelect from "../../../components/CustomSelect";
import TooltipIcon from "../../../components/TooltipIcon";
import { comdex } from "../../../config/network";
import { ValidateInputNumber } from "../../../config/_validation";
import { DEFAULT_FEE, DOLLAR_DECIMALS } from "../../../constants/common";
import { queryPair } from "../../../services/asset/query";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { getTypeURL } from "../../../services/transaction";
import {
  amountConversion, amountConversionWithComma, denomConversion, getAmount, getDenomBalance
} from "../../../utils/coin";
import { marketPrice } from "../../../utils/number";
import {
  iconNameFromDenom,
  toDecimals,
  uniqueDenoms
} from "../../../utils/string";
import variables from "../../../utils/variables";
import "../index.scss";

const marks = {
  0: "0%",
  150: "Min - 150%",
  200: "Safe: 200%",
};

const BorrowTab = ({
  lang,
  address,
  pairs,
  pair,
  balances,
  setPair,
  setAssetIn,
  setAssetOut,
  setAmountIn,
  setAmountOut,
  setComplete,
  inAmount,
  outAmount,
  markets,
  collateralRatio,
  setCollateralRatio,
  vaults,
  setVault,
  vault,
  refreshBalance,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();

  const assetMap = useSelector(
    (state) => state.asset.map
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!vault.id) {
      const initialPairId = Long.fromNumber(34);
      //TODO: take it from array
      fetchSelectedPair(initialPairId?.toNumber());
      updateSelectedVault(initialPairId);
    } else {
      fetchSelectedPair(vault?.pairId?.toNumber());
    }
  }, [pairs, vaults]);

  useEffect(() => {
    setAssetOut(pair && pair.denomOut);
    setAssetIn(pair && pair.denomIn);
  }, [pair]);

  useEffect(() => {
    setComplete(false);
    setCollateralRatio(200);
    resetValues();
  }, []);

  const onChange = (value) => {
    value = toDecimals(value).toString().trim();

    handleAmountInChange(value);
    setValidationError(
      ValidateInputNumber(getAmount(value), collateralAssetBalance)
    );
  };

  const fetchSelectedPair = (id) => {
    queryPair(id, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setPair(result.pairInfo);
    });
  };

  const updateSelectedVault = (pairId) => {
    const selectedVault = vaults.filter(
      (item) => item.pairId.toNumber() === pairId.toNumber()
    );

    setVault(selectedVault[0]);
  };

  const resetValues = () => {
    setAmountIn(0);
    setAmountOut(0);
  };

  const handleInAssetChange = (value) => {
    const selectedPair =
      pairs &&
      pairs.list.filter(
        (item) => item.denomIn === value && item.denomOut === pair.denomOut
      );

    if (selectedPair.length) {
      setPair(selectedPair[0]);
      updateSelectedVault(selectedPair[0].id);
    }

    setAssetIn(value);
    setValidationError(
      ValidateInputNumber(
        getAmount(inAmount),
        getDenomBalance(balances, value) || 0
      )
    );
    setAmountOut(
      calculateAmountOut(
        inAmount,
        selectedTokenPrice,
        collateralRatio / 100,
        marketPrice(markets, value, assetMap[value]?.id)
      )
    );
  };

  const handleOutAssetChange = (value) => {
    const selectedPair =
      pairs &&
      pairs.list.filter(
        (item) => item.denomIn === pair.denomIn && item.denomOut === value
      );

    if (selectedPair.length) {
      setPair(selectedPair[0]);
      updateSelectedVault(selectedPair[0].id);
    }

    setAssetOut(value);
    setAmountOut(
      calculateAmountOut(
        inAmount,
        selectedTokenPrice,
        collateralRatio / 100,
        marketPrice(markets, value, assetMap[value]?.id)
      )
    );
  };

  const handleSliderChange = (value) => {
    setCollateralRatio(value);
    setAmountOut(
      calculateAmountOut(
        inAmount,
        selectedTokenPrice,
        value / 100,
        marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)
      )
    );
  };

  const handleAmountInChange = (value) => {
    setValidationError(
      ValidateInputNumber(getAmount(value), collateralAssetBalance)
    );
    setAmountIn(value);
    setAmountOut(
      calculateAmountOut(
        value,
        selectedTokenPrice,
        collateralRatio / 100,
        marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)
      )
    );
  };

  const calculateAmountOut = (
    inAmount,
    inAssetPrice,
    ratio,
    amountOutPrice
  ) => {
    const amount = (inAmount * inAssetPrice) / (ratio * amountOutPrice);
    return ((isFinite(amount) && amount) || 0).toFixed(6);
  };

  const handleCreate = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }

    if (vault?.id) {
      message.info("This vault already exits. Try editing");
      return;
    }

    setInProgress(true);
    message.info("Transaction initiated");
    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: getTypeURL("create"),
          value: {
            from: address,
            amountIn: getAmount(inAmount),
            amountOut: getAmount(outAmount),
            pairId: pair?.id,
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
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
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
  };

  const selectedTokenPrice = marketPrice(markets, pair?.denomIn);

  const showAssetSpotPrice = (In) => {
    const price = marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id);
    const denomIn = denomConversion(pair?.denomIn);
    const denomOut = denomConversion(pair?.denomOut);

    if (In) {
      return `1 ${denomIn || ""} = ${Number(
        price ? selectedTokenPrice / price : 0
      ).toFixed(6)} ${denomOut || ""}`;
    } else {
      return `1 ${denomOut || ""} = ${Number(
        price / selectedTokenPrice
      ).toFixed(6)} ${denomIn || ""}`;
    }
  };

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

  const handleMaxClick = () => {
    if (pair?.denomIn === comdex.coinMinimalDenom) {
      return Number(collateralAssetBalance) > DEFAULT_FEE
        ? handleAmountInChange(
          amountConversion(collateralAssetBalance - DEFAULT_FEE)
        )
        : handleAmountInChange();
    } else {
      return handleAmountInChange(amountConversion(collateralAssetBalance));
    }
  };

  const collateralAssetBalance =
    getDenomBalance(balances, pair && pair.denomIn) || 0;

  const uniqCollateralDenoms = uniqueDenoms(pairs && pairs.list, "in");
  const uniqDebtDenoms = uniqueDenoms(pairs && pairs.list);

  return (
    <div className="borrw-content-card card-content-bg">
      <div className="borrow-tab-head">
        <div className="head-icons">
          <div className="head-icons-inner">
            <SvgIcon name={iconNameFromDenom(pair && pair.denomIn)} />
          </div>
        </div>
        <div className="head-icons">
          <div className="head-icons-inner">
            <SvgIcon name={iconNameFromDenom(pair && pair.denomOut)} />
          </div>
        </div>
        <div className="righttext">
          <h3>{variables[lang].borrow_cAssets}</h3>
          <p>
            {variables[lang].collateral} :{" "}
            {denomConversion(pair && pair.denomIn)}
          </p>
        </div>
      </div>
      <div className="assets-select-card mb-4">
        <div className="assets-left">
          <label className="leftlabel">
            {variables[lang].choose_collateral}
          </label>
          <div className="assets-select-wrapper">
            <CustomSelect
              list={uniqCollateralDenoms}
              value={pair && pair.denomIn}
              onChange={handleInAssetChange}
            />
          </div>
        </div>
        <div className="assets-right">
          <div className="label-right">
            {variables[lang].available}
            <span className="ml-1">
              {amountConversionWithComma(collateralAssetBalance)}{" "}
              {denomConversion(pair && pair.denomIn)}
            </span>
            <div className="maxhalf">
              <Button className="active" onClick={() => handleMaxClick()}>
                Max
              </Button>
            </div>
          </div>
          <div>
            <div className="input-select">
              <CustomInput
                value={inAmount}
                onChange={(event) => onChange(event.target.value)}
                validationError={validationError}
              />
            </div>
            <small>{showInAssetValue()}</small>
            <small>{showAssetSpotPrice("In")}</small>
          </div>
        </div>
      </div>
      <div className="slider-bar">
        <label>
          {variables[lang].set_collateral_ratio}{" "}
          <TooltipIcon text={variables[lang].liquidate_below_minimum} />
        </label>
        <div className="slider-numbers">
          <Slider
            className={
              "comdex-slider borrow-comdex-slider " +
              (collateralRatio <= 150
                ? " red-track"
                : collateralRatio < 200
                  ? " orange-track"
                  : collateralRatio >= 200
                    ? " green-track"
                    : " ")
            }
            defaultValue={collateralRatio}
            marks={marks}
            value={collateralRatio}
            max={500}
            onChange={handleSliderChange}
            min={0}
            tooltipVisible={false}
          />
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
      <div className="assets-select-card mt-4">
        <div className="assets-left">
          <label className="leftlabel">{variables[lang].borrow_cAsset}</label>
          <div className="assets-select-wrapper">
            <CustomSelect
              list={uniqDebtDenoms}
              value={pair && pair.denomOut}
              onChange={handleOutAssetChange}
            />
          </div>
        </div>
        <div className="assets-right">
          <div>
            <div className="input-select">
              <CustomInput value={outAmount} disabled />
            </div>
            <small>{showOutAssetValue()}</small>
            <small>{showAssetSpotPrice()}</small>
          </div>
        </div>
      </div>
      <Row>
        <Col sm="10" className="mt-3 mx-auto card-bottom-details">
          <Row className="mt-1">
            <Col>
              <label>{variables[lang].oracle_price}</label>
            </Col>
            <Col className="text-right">
              {marketPrice(markets, pair?.denomOut, assetMap[pair?.denomOut]?.id)?.toFixed(
                DOLLAR_DECIMALS
              )}{" "}
              {variables[lang].USD}
            </Col>
          </Row>
        </Col>
      </Row>
      <div className="assets-form-btn">
        <Button
          disabled={
            inProgress ||
            !pair ||
            !Number(inAmount) ||
            !Number(outAmount) ||
            validationError?.message ||
            Number(collateralRatio) < 150
          }
          loading={inProgress}
          type="primary"
          className="btn-filled"
          onClick={() => handleCreate()}
        >
          {variables[lang].borrow}{" "}
        </Button>
      </div>
    </div>
  );
};

export default BorrowTab;
