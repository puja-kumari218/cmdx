import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { connect } from "react-redux";
import { Button, Table, Progress, message } from "antd";
import "./index.scss";
import TooltipIcon from "../../components/TooltipIcon";
import { useEffect, useState } from "react";
import { queryUserVaults } from "../../services/vault/query";
import { amountConversion, amountConversionWithComma, denomConversion } from "../../utils/coin";
import { useNavigate } from "react-router";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { decimalConversion } from "../../utils/number";
import NoDataIcon from "../../components/common/NoDataIcon";

const MyVault = ({ address }) => {
  const [vaults, setVaults] = useState();
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    if (address) {
      fetchVaults();
    }
  }, [address]);

  const fetchVaults = () => {
    setInProgress(true);
    queryUserVaults(address, (error, result) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }
      setVaults(result?.vaultsInfo);
    });
  };

  const calculateProgressPercentage = (number) => {
    let ratio = 500 / number;
    let percentage = 100 / ratio;
    return percentage.toFixed(DOLLAR_DECIMALS);
  }

  const columns = [
    {
      title: <>
        Vault Type    <TooltipIcon text="Type of vault" />

      </>,
      dataIndex: "vault",
      key: "vault",
      width: 180,
    },
    {
      title: (
        <>
          Debt{" "}
          <TooltipIcon text="Composite Debt owed for this vault which is a sum of Composite borrowed and interest accrued" />
        </>
      ),
      dataIndex: "debt",
      key: "debt",
      width: 150,
    },
    {
      title: (
        <>
          Stability Fee{" "}
          <TooltipIcon text="Stability fee is the interest charged annually ( compounded per block) for current vault" />
        </>
      ),
      dataIndex: "apy",
      key: "apy",
      width: 150,
      render: (apy) => <>{Number((apy * 100) || 0).toFixed(DOLLAR_DECIMALS)}%</>,
    },
    {
      title: (
        <>
          Collateralization Ratio{" "}
          <TooltipIcon text="The collateral ratio of the vault which is equal to collateral deposited by composite borrowed" />
        </>
      ),
      dataIndex: "health",
      key: "health",
      width: 200,
      align: "center",
      render: (ratio) => (
        <>
          <span>{Number((decimalConversion(ratio?.collateralizationRatio) * 100) || 0).toFixed(DOLLAR_DECIMALS) || 0}%</span>
          <Progress
            className="health-progress ml-2"
            style={{ width: 130 }}
            percent={calculateProgressPercentage(Number((decimalConversion(ratio?.collateralizationRatio) * 100) || 0).toFixed(DOLLAR_DECIMALS))}
            showInfo={false}
            size="small"
            strokeColor={((Number((decimalConversion(ratio?.collateralizationRatio) * 100) || 0).toFixed(DOLLAR_DECIMALS)) < (Number(((decimalConversion(ratio?.minCr) * 100) || 0).toFixed(DOLLAR_DECIMALS)) + 50)) ? "orange" : ""}

          />
        </>
      ),
    },
    {
      title: (
        <>
          Action{" "}
        </>
      ),
      dataIndex: "action",
      key: "action",
      align: "right",
      width: 200,
      render: (item) => (
        <>
          <Button
            type="primary"
            className="btn-filled"
            size="small"
            onClick={() => handleRouteChange(item)}
          >
            Manage
          </Button>
        </>
      ),
    },
  ];

  const handleRouteChange = (item) => {
    navigate(`/mint/vault/${item?.extendedPairId?.toNumber()}`);
  };

  const tableData =
    vaults &&
    vaults?.length > 0 &&
    vaults?.map((item) => {
      return {
        key: item?.id,
        vault: (
          <>
            <div className="assets-withicon">{item?.extendedPairName || ""}</div>
          </>
        ),
        debt: <> {amountConversionWithComma(item?.debt || 0)} {denomConversion(item?.assetOutDenom)} </>,
        apy: decimalConversion(item?.interestRate || 0),
        health: (item ? item : 0),
        action: item,
      };
    });

  return (
    <div className="app-content-wrapper vaults-table-container">
      <Row>
        <Col>
          <div className="composite-card">
            <div className="card-content">
              <Table
                className="custom-table"
                dataSource={tableData}
                columns={columns}
                loading={inProgress}
                pagination={{ defaultPageSize: 5 }}
                scroll={{ x: "100%" }}
                locale={{ emptyText: <NoDataIcon /> }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

MyVault.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(MyVault);
