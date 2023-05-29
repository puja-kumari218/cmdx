import React from "react";
import CloseTab from "./CloseTab";
import PricePool from "../Mint/PricePool";
import VaultDetails from "../Mint/VaultDetails";
import "./index.scss";
const Close = () => {
  return (
    <>
      {/* For max content height add class close-content-card */}
      <div className="details-wrapper ">
        <div className="details-left farm-content-card earn-deposite-card vault-mint-card">
          <CloseTab />
        </div>
        <div className="details-right mint-detail-stats-container">
          <PricePool />
          <VaultDetails />
        </div>
      </div>
    </>
  );
};

export default Close;
