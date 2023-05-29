import { Button, Table, Input, Switch, Tabs } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { IoReload } from "react-icons/io5";
import { connect, useDispatch } from "react-redux";
import { Col, Row, SvgIcon } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import AssetList from "../../config/ibc_assets.json";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
} from "../../utils/coin";
import { commaSeparator, formateNumberDecimalsAuto, marketPrice } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import variables from "../../utils/variables";
import Deposit from "./Deposit";
import "./index.scss";
import LPAsssets from "./LPAassets";
import Withdraw from "./Withdraw";

const Assets = ({
  lang,
  assetBalance,
  balances,
  markets,
  refreshBalance,
  assetMap,
  harborPrice,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [isHideToggleOn, setHideToggle] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [filterValue, setFilterValue] = useState("1");

  const tabItems = [
    {
      key: "1",
      label: "Assets",
    },
    {
      key: "2",
      label: "LF Tokens",
    },
  ];

  const handleBalanceRefresh = () => {
    setLoading(true);
    let assetReloadBth = document.getElementById("reload-btn");
    assetReloadBth.classList.toggle("reload");
    if (!assetReloadBth.classList.contains("reload")) {
      assetReloadBth.classList.add("reload-2");
    } else {
      assetReloadBth.classList.remove("reload-2");
    }

    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleHideSwitchChange = (value) => {
    setHideToggle(value);
  };

  const onSearchChange = (searchKey) => {
    setSearchKey(searchKey.trim().toLowerCase());
  };

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      align: "center",
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
    },
    {
      title: "Oracle Price",
      dataIndex: "oraclePrice",
      key: "oraclePrice",
      align: "center",
      render: (price) => (
        <>
          ${formateNumberDecimalsAuto({ price: Number(price) || 0 })}
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (amount) => (
        <>
          <p>${commaSeparator(Number(Math.floor(amount * Math.pow(10, DOLLAR_DECIMALS)) / Math.pow(10, DOLLAR_DECIMALS)))}</p>
        </>
      ),
    },
    {
      title: "IBC Deposit",
      dataIndex: "ibcdeposit",
      key: "ibcdeposit",
      align: "center",
      render: (value) => {
        if (value) {
          return value?.depositUrlOverride ? (
            <Button
              type="primary btn-filled"
              size="small"
              className="external-btn"
            >
              <a
                href={value?.depositUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Deposit{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <SvgIcon name="hyperlink" />
                </span>
              </a>
            </Button>
          ) : (
            <Deposit
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
    {
      title: "IBC Withdraw",
      dataIndex: "ibcwithdraw",
      key: "ibcwithdraw",
      width: 110,
      render: (value) => {
        if (value) {
          return value?.withdrawUrlOverride ? (
            <Button
              type="primary btn-filled"
              size="small"
              className="external-btn"
            >
              <a
                href={value?.withdrawUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Withdraw{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <SvgIcon name="hyperlink" />
                </span>
              </a>
            </Button>
          ) : (
            <Withdraw
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
  ];


  const getPrice = (denom) => {
    if (denom === harbor?.coinMinimalDenom) {
      return harborPrice;
    }
    if (denom === "ucmst") {
      return markets?.cswapApiPrice?.ucmst?.price || 0;
    }

    return marketPrice(markets, denom, assetMap[denom]?.id) || 0;
  };

  let ibcBalances = AssetList?.tokens.map((token) => {
    const ibcBalance = balances.find(
      (item) => item.denom === token?.ibcDenomHash
    );
    return {
      chainInfo: getChainConfig(token),
      coinMinimalDenom: token?.coinMinimalDenom,
      symbol: token?.symbol,
      balance: {
        amount: ibcBalance?.amount
          ? amountConversion(
            ibcBalance.amount,
            comdex?.coinDecimals,
            assetMap[ibcBalance?.denom]?.decimals
          )
          : 0,
        price: getPrice(ibcBalance?.denom) || 0,
      },
      sourceChannelId: token.comdexChannel,
      destChannelId: token.channel,
      ibcDenomHash: token?.ibcDenomHash,
      explorerUrlToTx: token?.explorerUrlToTx,
      depositUrlOverride: token?.depositUrlOverride,
      withdrawUrlOverride: token?.withdrawUrlOverride,
    };
  });

  const nativeCoin = balances.filter(
    (item) => item.denom === comdex?.coinMinimalDenom
  )[0];
  const cmstCoin = balances.filter(
    (item) => item.denom === cmst?.coinMinimalDenom
  )[0];
  const harborCoin = balances.filter(
    (item) => item.denom === harbor?.coinMinimalDenom
  )[0];

  const nativeCoinValue =
    getPrice(nativeCoin?.denom) *
    (nativeCoin?.amount ? Number(amountConversion(nativeCoin?.amount)) : 0);

  const cmstCoinValue =
    getPrice(cmstCoin?.denom) *
    (cmstCoin?.amount ? Number(amountConversion(cmstCoin?.amount)) : 0);

  const harborCoinValue =
    getPrice(harborCoin?.denom) *
    (harborCoin?.amount ? Number(amountConversion(harborCoin?.amount)) : 0);

  const currentChainData = [
    {
      key: comdex.chainId,
      symbol: comdex?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(comdex?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(comdex?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: nativeCoin?.amount ? amountConversion(nativeCoin.amount) : 0,
      oraclePrice: getPrice(comdex?.coinMinimalDenom),
      amount: nativeCoinValue || 0,
    },
    {
      key: cmst?.coinDenom,
      symbol: cmst?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(cmst?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(cmst?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: cmstCoin?.amount ? amountConversion(cmstCoin.amount) : 0,
      oraclePrice: getPrice(cmst?.coinMinimalDenom),
      amount: cmstCoinValue || 0,
    },
    {
      key: harbor?.coinDenom,
      symbol: harbor?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(harbor?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(harbor?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: harborCoin?.amount ? amountConversion(harborCoin.amount) : 0,
      oraclePrice: getPrice(harbor?.coinMinimalDenom),

      amount: harborCoinValue || 0,
    },
  ];

  const tableIBCData =
    ibcBalances &&
    ibcBalances.map((item) => {
      return {
        key: item?.coinMinimalDenom,
        symbol: item?.symbol,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.ibcDenomHash)} />
              </div>
              {denomConversion(item?.ibcDenomHash)}{" "}
            </div>
          </>
        ),
        noOfTokens: item?.balance?.amount,
        oraclePrice: getPrice(item?.ibcDenomHash),
        amount: Number(item.balance?.amount) * item.balance?.price,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  let allTableData = Lodash.concat(currentChainData, tableIBCData);

  let tableData = isHideToggleOn
    ? allTableData?.filter((item) => Number(item?.noOfTokens) > 0)
    : allTableData;

  tableData = searchKey ? tableData?.filter((item) => {
    return ((item?.symbol).toLowerCase()).includes(searchKey.toLowerCase())
  }) : tableData;

  let balanceExists = allTableData?.find(
    (item) => Number(item?.noOfTokens) > 0
  );

  const onChange = (key) => {
    setFilterValue(key);
  };

  return (
    <div className="app-content-wrapper">
      <div className=" assets-section">
        <Row>
          <Col>
            <div className="assets-head">
              <div>
                <h2>{variables[lang].comdex_assets}</h2>
              </div>
              <div className="total-asset-balance-main-container">
                <span>{variables[lang].total_asset_balance}</span>{" "}
                {commaSeparatorWithRounding(assetBalance, DOLLAR_DECIMALS)}{" "}
                {variables[lang].USD}{" "}
                <div className="d-flex">
                  <span
                    className="asset-reload-btn"
                    id="reload-btn-container"
                    onClick={() => handleBalanceRefresh()}
                  >
                    {" "}
                    <IoReload id="reload-btn" />{" "}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <div className="mt-4">
            {/* <Tabs
              defaultActiveKey="1"
              items={tabItems}
              activeKey={filterValue}
              onChange={onChange}
              className="comdex-tabs farm-details-tabmain"
            /> */}
          </div>
          <Col className="assets-search-section">
            <div>
              Hide 0 Balances{" "}
              <Switch
                disabled={!balanceExists}
                onChange={(value) => handleHideSwitchChange(value)}
                checked={isHideToggleOn}
              />
            </div>
            <Input
              placeholder="Search Asset.."
              onChange={(event) => onSearchChange(event.target.value)}
              suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
            />
          </Col>
        </Row>


        <Row>
          <Col>
            {filterValue === "1" ? (
              <Table
                className="custom-table assets-table"
                dataSource={tableData}
                columns={columns}
                loading={loading}
                pagination={false}
                scroll={{ x: "100%" }}
                locale={{ emptyText: <NoDataIcon /> }}
              />
            ) : (
              <LPAsssets
                isHideToggleOn={isHideToggleOn}
                searchKey={searchKey}
                activeKey={filterValue}
              />
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

Assets.propTypes = {
  lang: PropTypes.string.isRequired,
  assetBalance: PropTypes.number,
  refreshBalance: PropTypes.number.isRequired,
  assetMap: PropTypes.object,
  harborPrice: PropTypes.number.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market,
    refreshBalance: state.account.refreshBalance,
    assetMap: state.asset.map,
    harborPrice: state.liquidity.harborPrice,
  };
};

export default connect(stateToProps)(Assets);
