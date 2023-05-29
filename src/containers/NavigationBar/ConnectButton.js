import { Button, Dropdown, message } from "antd";
import { decode } from "js-base64";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAssetBalance,
  setPoolBalance,
  showAccountConnectModal
} from "../../actions/account";
import { setAssetList } from "../../actions/asset";
import { setMarkets, setCoingekoPrice, setCswapApiPrice } from "../../actions/oracle";
import { setHarborPrice } from "../../actions/liquidity";
import { cmst, comdex, harbor, ibcDenoms } from "../../config/network";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../../constants/common";
import { queryAssets } from "../../services/asset/query";
import { queryAllBalances } from "../../services/bank/query";
import { fetchKeplrAccountName, initializeChain } from "../../services/keplr";
import { fetchCoingeckoPrices, fetchRestPrices, queryMarketList } from "../../services/oracle/query";
import { marketPrice } from "../../utils/number";
import variables from "../../utils/variables";
import DisConnectModal from "../DisConnectModal";
import ConnectModal from "../Modal";
import { amountConversion } from "../../utils/coin";
import { encode } from "js-base64";

const ConnectButton = ({
  setAccountAddress,
  address,
  setAccountBalances,
  lang,
  setAssetBalance,
  setPoolBalance,
  markets,
  refreshBalance,
  setMarkets,
  poolBalances,
  setAccountName,
  balances,
  assetMap,
  setHarborPrice,
  harborPrice,
  setCoingekoPrice,
  setCswapApiPrice,
}) => {
  const dispatch = useDispatch();
  const [addressFromLocal, setAddressFromLocal] = useState()

  const subscription = {
    "jsonrpc": "2.0",
    "method": "subscribe",
    "id": "0",
    "params": {
      "query": `coin_spent.spender='${address}'`
    },
  };

  const subscription2 = {
    "jsonrpc": "2.0",
    "method": "subscribe",
    "id": "0",
    "params": {
      "query": `coin_received.receiver='${address}'`
    }
  };

  useEffect(() => {
    if (address) {
      let ws = new WebSocket(`${comdex?.webSocketApiUrl}`);

      ws.onopen = () => {
        ws.send(JSON.stringify(subscription));
        ws.send(JSON.stringify(subscription2));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response?.result?.events) {
          const savedAddress = localStorage.getItem("ac");
          const userAddress = savedAddress ? decode(savedAddress) : address;
          fetchBalances(userAddress);
        }
      };

      ws.onclose = () => {
        console.log("Connection Closed! 0");
      };

      ws.onerror = (error) => {
        console.log(error, "WS Error");
      };
    }
  }, [address]);


  useEffect(() => {
    const savedAddress = localStorage.getItem("ac");
    const userAddress = savedAddress ? decode(savedAddress) : address;

    if (userAddress) {
      setAccountAddress(userAddress);

      fetchKeplrAccountName().then((name) => {
        setAccountName(name);
      });
    }
  }, [address, refreshBalance]);

  useEffect(() => {
    fetchAssets(
      (DEFAULT_PAGE_NUMBER - 1) * (DEFAULT_PAGE_SIZE * 2),
      DEFAULT_PAGE_SIZE * 10,
      true,
      false
    );
  }, []);

  useEffect(() => {
    let addressAlreadyExist = localStorage.getItem("ac");
    addressAlreadyExist = addressAlreadyExist ? decode(addressAlreadyExist) : "";
    setAddressFromLocal(addressAlreadyExist)
  }, [])

  useEffect(() => {
    let walletType = localStorage.getItem("loginType");

    if (addressFromLocal) {

      initializeChain(walletType, (error, account) => {
        if (error) {
          message.error(error);
          return;
        }
        setAccountAddress(account.address);
        fetchKeplrAccountName().then((name) => {
          setAccountName(name);
        })
        localStorage.setItem("ac", encode(account.address));
        localStorage.setItem("loginType", walletType || "keplr")
      });
    }

  }, [addressFromLocal])



  useEffect(() => {
    fetchMarkets();
    fetchCoingeckoPrice()
    fetchPrices();
  }, [refreshBalance]);

  const getPrice = (denom) => {
    if (denom === harbor?.coinMinimalDenom) {
      return harborPrice;
    }
    return marketPrice(markets, denom, assetMap[denom]?.id) || 0;
  };

  const calculateAssetBalance = useCallback(
    (balances) => {
      const assetBalances = balances.filter(
        (item) =>
          item.denom.substr(0, 4) === "ibc/" ||
          item.denom === comdex.coinMinimalDenom ||
          item.denom === cmst.coinMinimalDenom ||
          item.denom === harbor.coinMinimalDenom
      );

      const value = assetBalances.map((item) => {
        return getPrice(item.denom) * amountConversion(item.amount, comdex?.coinDecimals, assetMap[item?.denom]?.decimals);
      });



      setAssetBalance(Lodash.sum(value));
    },
    [getPrice, setAssetBalance]
  );

  const calculatePoolBalance = useCallback(() => {
    const sum = Lodash.sumBy(poolBalances);

    setPoolBalance(Number(sum * 10 ** 6));
  }, [poolBalances, setPoolBalance]);

  const fetchBalances = useCallback(
    (address) => {
      queryAllBalances(address, (error, result) => {
        if (error) {
          return;
        }

        setAccountBalances(result.balances, result.pagination);
        calculateAssetBalance(result.balances);
        calculatePoolBalance(result.balances);
      });
    },
    [calculateAssetBalance, setAccountBalances, calculatePoolBalance]
  );

  useEffect(() => {
    if (address) {
      fetchBalances(address);
    }
  }, [address, refreshBalance, markets]);

  useEffect(() => {
    calculateAssetBalance(balances);
  }, [balances, markets, assetMap]);

  const fetchMarkets = (offset, limit, isTotal, isReverse) => {
    queryMarketList(offset, limit, isTotal, isReverse, (error, result) => {
      if (error) {
        return;
      }

      setMarkets(result.timeWeightedAverage, result.pagination);
    });
  };

  const fetchCoingeckoPrice = () => {
    fetchCoingeckoPrices((error, result) => {
      if (error) {
        return;
      }
      if (result) {
        setCoingekoPrice(result)
      }
    });
  };

  const fetchAssets = (offset, limit, countTotal, reverse) => {
    queryAssets(offset, limit, countTotal, reverse, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }

      dispatch(setAssetList(data.assets));
    });
  };

  const fetchPrices = () => {
    fetchRestPrices((error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      setCswapApiPrice(result)
      let harborPriceList = result?.filter((item) => item.denom === "uharbor");
      if (result) {
        if (isNaN(harborPriceList[0]?.price)) {
          return setHarborPrice(0)
        } else {
          return setHarborPrice(harborPriceList[0]?.price)
        }
      }
      else {
        return setHarborPrice(0)
      }
    });
  };

  const items = [
    { label: <ConnectModal />, key: 'item-1' }
  ];


  return (
    <>
      {address ? (
        <div className="connected_div">
          <DisConnectModal />
        </div>
      ) : (
        <div>
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="dropconnect-overlay"
          >
            <Button shape="round" type="primary">
              {variables[lang].connect}
            </Button>
          </Dropdown>
        </div>
      )}
    </>
  );
};

ConnectButton.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  showAccountConnectModal: PropTypes.func.isRequired,
  setAccountBalances: PropTypes.func.isRequired,
  setAccountName: PropTypes.func.isRequired,
  setAssetBalance: PropTypes.func.isRequired,
  setMarkets: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  harborPrice: PropTypes.number.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  poolBalances: PropTypes.array,
  pools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      reserveAccountAddress: PropTypes.string,
      poolCoinDenom: PropTypes.string,
      reserveCoinDenoms: PropTypes.array,
    })
  ),
  show: PropTypes.bool,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    show: state.account.showModal,
    markets: state.oracle.market,
    refreshBalance: state.account.refreshBalance,
    poolBalances: state.liquidity.poolBalances,
    harborPrice: state.liquidity.harborPrice,
    pools: state.liquidity.pool.list,
    balances: state.account.balances.list,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  showAccountConnectModal,
  setAccountAddress,
  setAccountBalances,
  setPoolBalance,
  setAssetBalance,
  setMarkets,
  setAccountName,
  setHarborPrice,
  setCoingekoPrice,
  setCswapApiPrice,
};

export default connect(stateToProps, actionsToProps)(ConnectButton);
