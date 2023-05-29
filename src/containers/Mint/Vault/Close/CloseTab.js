import { Button, message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { setBalanceRefresh, setVault } from "../../../../actions/account";
import { setExtendedPairVaultListData, setOwnerVaultId, setOwnerVaultInfo } from "../../../../actions/locker";
import Snack from "../../../../components/common/Snack";
import CustomSkelton from "../../../../components/CustomSkelton";
import TooltipIcon from "../../../../components/TooltipIcon";
import { comdex } from "../../../../config/network";
import { PRODUCT_ID } from "../../../../constants/common";
import { queryPair, queryPairVault } from "../../../../services/asset/query";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import { queryOwnerVaults, queryOwnerVaultsInfo } from "../../../../services/vault/query";
import { amountConversion, getDenomBalance } from "../../../../utils/coin";
import { decimalConversion } from "../../../../utils/number";
import { denomToSymbol } from "../../../../utils/string";
import variables from "../../../../utils/variables";
import "./index.scss";

const CloseTab = ({
  lang,
  address,
  vault,
  setVault,
  refreshBalance,
  setBalanceRefresh,
  balances,
  ownerVaultId,
  ownerVaultInfo,
  setOwnerVaultId,
  setOwnerVaultInfo,
  assetMap,
}) => {
  const dispatch = useDispatch();
  const { pathVaultId } = useParams();

  const selectedExtentedPairVault = useSelector((state) => state.locker.selectedExtentedPairVault);
  const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData);
  const pairId = selectedExtentedPairVaultListData && selectedExtentedPairVaultListData[0]?.pairId?.toNumber();

  const [inProgress, setInProgress] = useState(false);
  const [pair, setPair] = useState();
  const navigate = useNavigate();
  const payableCMST = Number(Number(amountConversion(ownerVaultInfo?.amountOut || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals)) + Number(amountConversion(ownerVaultInfo?.closingFeeAccumulated || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals) || 0) + Number(amountConversion(ownerVaultInfo?.interestAccumulated || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals))).toFixed(comdex.coinDecimals);

  const debtAssetBalance = amountConversion(getDenomBalance(balances, pair && pair?.denomOut) || 0);


  useEffect(() => {
    fetchQueryPairValut(pathVaultId)
  }, [address])

  useEffect(() => {
    if (address && selectedExtentedPairVaultListData[0]?.id?.toNumber()) {
      getOwnerVaultId(PRODUCT_ID, address, selectedExtentedPairVaultListData[0]?.id?.toNumber());
    }
    else {
      setOwnerVaultId("")
    }
  }, [address, vault])

  useEffect(() => {
    if (ownerVaultId) {
      getOwnerVaultInfoByVaultId(ownerVaultId)
    }
    else {
      setOwnerVaultInfo('');
    }
  }, [address, ownerVaultId])


  // ******* Get Vault Query *********

  // *----------Get the owner vaultId by productId, pairId , and address----------

  const getOwnerVaultId = (productId, address, extentedPairId) => {
    queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultId(data?.vaultId?.toNumber())
    })
  }

  // *----------Get pair vault data by extended pairVault Id----------
  const fetchQueryPairValut = (pairVaultId) => {
    queryPairVault(pairVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }

      dispatch(setExtendedPairVaultListData(data?.pairVault))
    })
  }

  // *----------Get the owner vaultDetails by ownervaultId----------

  const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
    queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultInfo(data.vault)
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

  const handleClick = () => {
    setInProgress(true);
    if (Number(debtAssetBalance) < Number(payableCMST)) {
      message.error("Insufficient funds")
      setInProgress(false);
      return;
    }

    if (
      Number(getDenomBalance(balances, vault?.debt?.denom)) <
      Number(vault?.debt?.amount)
    ) {
      message.info("Insufficient funds");
      setInProgress(false);
      return;
    }

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.vault.v1beta1.MsgCloseRequest",
          value: {
            from: address,
            appId: Long.fromNumber(PRODUCT_ID),
            extendedPairVaultId: Long.fromNumber(selectedExtentedPairVaultListData[0]?.id?.toNumber()),
            userVaultId: ownerVaultId,
          },
        },
        fee: defaultFee(),
        memo: "",
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

        setVault({}); // clearing local vault as it is closed.
        setBalanceRefresh(refreshBalance + 1);
        message.success(
          <Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex?.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        );
        navigate("/mint")
      }
    );


  };


  useEffect(() => {
    if (pairId) {
      getAssetDataByPairId(pairId);
    }
  }, [address, pairId, refreshBalance])

  return (
    <div className="borrw-content-card ">
      <div className="close-tab-content">
        {/* <div className="close-tab-row">
          <div className="text-left">
            Closing Fee Amount{" "}
          </div>
          <div className="text-right d-flex align-center">
            {amountConversion(ownerVaultInfo?.closingFeeAccumulated || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals) || 0} {pair && pair.denomIn ? denomToSymbol(pair && pair?.denomOut) : <span className="ml-1"><CustomSkelton height={20} /></span>}
          </div>
        </div> */}
        <div className="close-tab-row">
          <div className="text-left">
            Total CMST Payable{" "}
            <TooltipIcon text="Closing fee and Stability fee has been included. Users needs to click on the Fetch interest button to update the amount." />
          </div>
          <div className="text-right d-flex align-center">
            {Number(Number(amountConversion(ownerVaultInfo?.amountOut || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals)) + Number(amountConversion(ownerVaultInfo?.closingFeeAccumulated || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals) || 0) + Number(amountConversion(ownerVaultInfo?.interestAccumulated || 0, comdex.coinDecimals, assetMap[pair?.denomOut]?.decimals))).toFixed(comdex.coinDecimals)} {pair && pair.denomIn ? denomToSymbol(pair && pair?.denomOut) : <span className="ml-1"><CustomSkelton height={20} /></span>}
          </div>
        </div>
        <div className="close-tab-row">
          <div className="text-left">
            Collateral Receivable{" "}
            <TooltipIcon text="Collateral to be received" />
          </div>
          <div className="text-right d-flex align-center">
            {amountConversion(ownerVaultInfo?.amountIn || 0, comdex.coinDecimals, assetMap[pair?.denomIn]?.decimals)} {pair && pair.denomIn ? denomToSymbol(pair && pair?.denomIn) : <span className="ml-1"><CustomSkelton height={20} /></span>}
          </div>
        </div>
      </div>
      <div className="assets-form-btn">
        <Button
          loading={inProgress}
          disabled={
            inProgress
          }
          type="primary"
          onClick={() => handleClick()}
          className="btn-filled"
        >
          {variables[lang].close}
        </Button>
      </div>
    </div>
  );
};

CloseTab.propTypes = {
  lang: PropTypes.string.isRequired,
  setBalanceRefresh: PropTypes.func.isRequired,
  setVault: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  refreshBalance: PropTypes.number.isRequired,
  assetMap: PropTypes.object,
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
  ownerVaultId: PropTypes.number,
  ownerVaultInfo: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    vault: state.account.vault,
    markets: state.oracle.market,
    refreshBalance: state.account.refreshBalance,
    balances: state.account.balances.list,
    ownerVaultId: state.locker.ownerVaultId,
    ownerVaultInfo: state.locker.ownerVaultInfo,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  setVault,
  setBalanceRefresh,
  setOwnerVaultId,
  setOwnerVaultInfo,
};

export default connect(stateToProps, actionsToProps)(CloseTab);

// panic message redacted to hide potentially sensitive system info: panic