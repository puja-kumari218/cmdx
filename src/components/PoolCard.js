import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { queryLiquidityPair } from "../services/liquidity/query";
import { amountConversionWithComma, denomConversion } from "../utils/coin";
import { marketPrice } from "../utils/number";
import { iconNameFromDenom } from "../utils/string";
import variables from "../utils/variables";
import { SvgIcon } from "./common";

const PoolCard = ({ lang, pool, markets, assetMap }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pair, setPair] = useState();

  useEffect(() => {
    if (pool?.pairId) {
      queryLiquidityPair(pool?.pairId, (error, result) => {
        if (!error) {
          setPair(result?.pair);
        }
      });
    }
  }, [pool]);

  const calculatePoolLiquidity = (poolBalance) => {
    if (poolBalance && poolBalance.length > 0) {
      const values = poolBalance.map(
        (item) =>
          Number(item?.amount) *
          marketPrice(markets, item?.denom, assetMap[item?.denom]?.id)
      );
      return values.reduce((prev, next) => prev + next, 0); // returning sum value
    } else return 0;
  };

  const TotalPoolLiquidity = amountConversionWithComma(
    calculatePoolLiquidity(pool?.balances),
    2
  );

  const showPairDenoms = () => {
    if (pair?.baseCoinDenom) {
      return `${denomConversion(pair?.baseCoinDenom)}/${denomConversion(
        pair?.quoteCoinDenom
      )}`;
    }
  };

  return (
    <div className="dashboard-bottom-card-border">
      <div className="dashboard-card">
        <div className="dashboard-card-inner">
          <div className="card-upper">
            <h3>{showPairDenoms()}</h3>
            <div className="card-svg-icon-container">
              <div className="card-svgicon card-svgicon-1">
                <div className="card-svgicon-inner">
                  <SvgIcon
                    name={iconNameFromDenom(pair?.baseCoinDenom)}
                    viewBox="0 0 23.515 31"
                  />{" "}
                </div>
              </div>
              <div className="card-svgicon  card-svgicon-2">
                <div className="card-svgicon-inner">
                  <SvgIcon name={iconNameFromDenom(pair?.quoteCoinDenom)} />{" "}
                </div>
              </div>
            </div>
          </div>
          <div className="card-bottom">
            <div className="cardbottom-row">
              <label>{variables[lang].poolLiquidity}</label>
              <p>{`$${TotalPoolLiquidity}`}</p>
            </div>
            <div className="cardbottom-row">
              <label>{variables[lang].apr}</label>
              <p>-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PoolCard.propTypes = {
  assetMap: PropTypes.object,
  lang: PropTypes.string,
  markets: PropTypes.object,
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
    reserveCoinDenoms: PropTypes.array,
  }),
  poolIndex: PropTypes.number,
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market,
    assetMap: state.asset.map,
  };
};

export default connect(stateToProps)(PoolCard);
