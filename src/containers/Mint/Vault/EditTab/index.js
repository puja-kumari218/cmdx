import React, { useEffect, useState } from "react";
import PricePool from "../Mint/PricePool";
import VaultDetails from "../Mint/VaultDetails";
import Edit from "./Tab";
import "./index.scss";
import { Spin } from "antd";
import { queryPair } from "../../../../services/asset/query";
import { useSelector } from "react-redux";

const EditTab = () => {
  const [loading, setLoading] = useState();
  const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData);
  const pairId = selectedExtentedPairVaultListData && selectedExtentedPairVaultListData[0]?.pairId?.toNumber();

  useEffect(() => {
    if (pairId) {
      getAssetDataByPairId(pairId);
    }
  }, [pairId,])

  const getAssetDataByPairId = (pairId) => {
    setLoading(true)
    queryPair(pairId, (error, data) => {
      if (error) {
        setLoading(false)
        return;
      }
      setLoading(false)

    })
  }

  if (loading) {
    return <div className="spinner"><Spin /></div>
  }


  return (
    <>
      <div className="details-wrapper">
        <div className="details-left farm-content-card earn-deposite-card vault-mint-card">
          <Edit />
        </div>
        <div className="details-right mint-detail-stats-container">
          <PricePool />
          <VaultDetails />
        </div>
      </div>
    </>
  );
};

export default EditTab;
