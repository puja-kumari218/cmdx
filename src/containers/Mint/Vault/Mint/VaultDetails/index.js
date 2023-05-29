import { message } from 'antd';
import * as PropTypes from "prop-types";
import React, { useEffect } from 'react'
import { connect, useSelector } from 'react-redux';
import { DOLLAR_DECIMALS, PRODUCT_ID } from '../../../../../constants/common';
import { queryOwnerVaults, queryOwnerVaultsInfo } from '../../../../../services/vault/query';
import { setOwnerVaultId, setOwnerVaultInfo } from '../../../../../actions/locker';
import moment from 'moment';
import { decimalConversion } from '../../../../../utils/number';
import TooltipIcon from '../../../../../components/TooltipIcon';
import { transformPairName } from '../../../../../utils/string';


const VaultDetails = ({
  address,
  item,
  ownerVaultId,
  setOwnerVaultId,
  ownerVaultInfo,
  setOwnerVaultInfo,
}) => {

  const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData[0]);

  useEffect(() => {
    if (address && selectedExtentedPairVaultListData?.id?.toNumber()) {
      getOwnerVaultId(PRODUCT_ID, address, selectedExtentedPairVaultListData?.id?.toNumber());
    } else {
      setOwnerVaultId("")
    }
  }, [address, item])

  useEffect(() => {
    if (ownerVaultId) {
      getOwnerVaultInfoByVaultId(ownerVaultId)
    }
    else {
      setOwnerVaultInfo('');
    }
  }, [address, ownerVaultId])


  const dateFormater = (value) => {
    let date = moment(value).format("DD-MM-YYYY");
    return date;

  }

  const getOwnerVaultId = (productId, address, extentedPairId) => {
    queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultId(data?.vaultId?.toNumber())
    })
  }

  const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
    queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultInfo(data?.vault)

    })
  }

  return (
    <>
      <div className="composite-card farm-content-card earn-deposite-card ">
        <div className="card-head">
          <div className="head-left">Vault : {transformPairName(selectedExtentedPairVaultListData?.pairName)}</div>
        </div>
        <div className="card-assets-container">
          <div className="assets-row">
            <div className="asset-name">Vault ID <TooltipIcon text='Unique Vault ID created per vault address and vault type' /></div>
            <div className="asset-value">{ownerVaultId || "-"}</div>
          </div>
          <div className="assets-row">
            <div className="asset-name">Stability Fee <TooltipIcon text='Current Interest Rate on Borrowed Amount' /></div>
            <div className="asset-value">{(decimalConversion(selectedExtentedPairVaultListData?.stabilityFee) * 100 || 0).toFixed(DOLLAR_DECIMALS)}%</div>
          </div>
          <div className="assets-row">
            <div className="asset-name">Drawdown Fee <TooltipIcon text='Drawdown Fee charged is a one time value deducted per withdrawal. The value fee collected is added to the collector module' /></div>
            <div className="asset-value">{decimalConversion(selectedExtentedPairVaultListData?.drawDownFee) * 100 || "0"}%</div>
          </div>
          <div className="assets-row">
            <div className="asset-name">  Min. Collateralization Ratio <TooltipIcon text='Minimum collateral ratio at which composite should be minted' /></div>
            <div className="asset-value">{Number(decimalConversion(selectedExtentedPairVaultListData?.minCr) * 100).toFixed(2) || "0"}%</div>
          </div>
          <div className="assets-row">
            <div className="asset-name">Vault Opening Date <TooltipIcon text='The date the Vault was opened' /></div>
            <div className="asset-value">{ownerVaultId ? dateFormater(ownerVaultInfo?.createdAt) : "-"}</div>
          </div>
        </div>
      </div>
    </>
  );
}
VaultDetails.prototype = {
  address: PropTypes.string,
  ownerVaultId: PropTypes.string,
  ownerVaultInfo: PropTypes.array,
}

const stateToProps = (state) => {
  return {
    address: state.account.address,
    ownerVaultId: state.locker.ownerVaultId,
    ownerVaultInfo: state.locker.ownerVaultInfo
  };
};

const actionsToProps = {
  setOwnerVaultId,
  setOwnerVaultInfo,
};
export default connect(stateToProps, actionsToProps)(VaultDetails);
