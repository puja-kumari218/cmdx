import React, { useEffect, useState } from "react";
import { Tabs, Button } from "antd";
import * as PropTypes from "prop-types";
import "./index.scss";
import { Col, Row } from "../../../components/common";
import { Link } from "react-router-dom";
import Mint from "./Mint";
import Close from "./Close";
import EditTab from "./EditTab";
import { connect, useSelector } from "react-redux";
import { setOwnerVaultId } from "../../../actions/locker";

const Vault = ({
  address,
  setOwnerVaultId,
}) => {
  const [activeKey, setActiveKey] = useState();
  const { TabPane } = Tabs;
  const ownerVaultId = useSelector((state) => state.locker.ownerVaultId);

  const tabsItems =
    [
      { label: "Mint", key: "1", children: <Mint /> },
      { label: "Edit", key: "2", disabled: !ownerVaultId, children: <EditTab /> },
      { label: "Close", key: "3", disabled: !ownerVaultId, children: <Close /> },
    ]

  const BackButton = {
    right: (
      <Link to="/mint">
        <Button className="back-btn" type="primary">
          Back
        </Button>
      </Link>
    ),
  };

  return (
    <>
      <div className="app-content-wrapper">
        <Row>
          <Col>
            <Tabs
              className="comdex-tabs"
              onChange={setActiveKey}
              activeKey={activeKey}
              tabBarExtraContent={BackButton}
              items={tabsItems}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};
Vault.prototype = {
  address: PropTypes.string,
}
const stateToProps = (state) => {
  return {
    address: state.account.address,
  };
};
const actionsToProps = {
  setOwnerVaultId,
};

export default connect(stateToProps, actionsToProps)(Vault);
