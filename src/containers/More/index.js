import "./index.scss";
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../components/common";
import { Table } from "antd";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Modal, message } from "antd";
import { denomToSymbol, iconNameFromDenom } from "../../utils/string";
import { amountConversionWithComma, denomConversion } from "../../utils/coin";
import { setBalanceRefresh } from "../../actions/account";
import { claimableRewards } from "../../services/rewardContractsWrite";
import { DOLLAR_DECIMALS, PRODUCT_ID } from "../../constants/common";
import { transactionClaimRewards } from "../../services/rewardContractsRead";
import { totalClaimableRebase } from "../../services/rebasingContractRead";
import TooltipIcon from "../../components/TooltipIcon";
import { transactionForClaimRebase } from "../../services/rebaseingContractWrite";
import Snack from "../../components/common/Snack";
import variables from "../../utils/variables";
import { comdex } from "../../config/network";
import NoDataIcon from "../../components/common/NoDataIcon";

const More = ({
  lang,
  address,
  refreshBalance,
  setBalanceRefresh,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRebasingModalVisible, setIsRebasingModalVisible] = useState(false);
  const [claimableRewardsData, setClaimableRewardsData] = useState()
  const [claimableRebaseData, setClaimableRebaseData] = useState()
  const [current, setCurrent] = useState(0);

  const handleRouteChange = (path) => {
    navigate({
      pathname: path,
    });
  };


  const showModal = () => {
    fetchClaimeableRewards(PRODUCT_ID, address)
    setIsModalVisible(true);
  };

  const showRebasingModal = () => {
    setIsRebasingModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleRebasingOk = () => {
    setIsRebasingModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleRebasingCancel = () => {
    setIsRebasingModalVisible(false);
  };


  // Query 
  const fetchClaimeableRewards = (productId, address) => {
    setLoading(true)
    claimableRewards(productId, address).then((res) => {
      setClaimableRewardsData(res)
      setLoading(false)
    }).catch((error) => {
      console.log(error);
      setLoading(false)
    })
  }

  const fetchClaimeableRebase = (productId, address) => {
    setLoading(true)
    totalClaimableRebase(productId, address).then((res) => {
      setClaimableRebaseData(res)
      setLoading(false)
    }).catch((error) => {
      console.log(error);
      setLoading(false)
    })
  }

  const claimReward = () => {
    setLoading(true)
    if (address) {
      transactionClaimRewards(address, PRODUCT_ID, (error, result) => {
        if (error) {
          message.error(error?.rawLog || "Transaction Failed")
          setLoading(false)
          return;
        }
        message.success(
          < Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex?.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        )
        setBalanceRefresh(refreshBalance + 1);
        setLoading(false)
      })
    }
    else {
      setLoading(false)
      message.error("Please Connect Wallet")
    }
  }

  const claimRebase = (proposalId) => {
    setCurrent(proposalId)
    setLoading(true)
    if (address) {
      transactionForClaimRebase(address, PRODUCT_ID, proposalId, (error, result) => {
        if (error) {
          message.error(error?.rawLog || "Transaction Failed")
          setLoading(false)
          return;
        }
        message.success(
          < Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex?.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        )
        setBalanceRefresh(refreshBalance + 1);
        setLoading(false)
      })
    }
    else {
      setLoading(false)
      message.error("Please Connect Wallet")
    }
  }

  // UseEffect calls 
  useEffect(() => {
    fetchClaimeableRewards(PRODUCT_ID, address)
    fetchClaimeableRebase(PRODUCT_ID, address)
  }, [address, refreshBalance])

  const columns = [
    {
      title: (
        <>
          Asset
        </>
      ),
      dataIndex: "asset",
      key: "asset",
      width: 150,
    },
    {
      title: (
        <>
          You Earned{" "}
        </>
      ),
      dataIndex: "you_earned",
      key: "you_earned",
      width: 150,
      align: "right",
    },

  ];

  const tableData =
    claimableRewardsData && claimableRewardsData.map((item, index) => {
      return {
        key: index,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(
                    item?.denom
                  )}
                />
              </div>
              {denomToSymbol(item.denom)}
            </div>
          </>
        ),
        you_earned: (
          <>
            <div className="assets-withicon display-right">
              {amountConversionWithComma(item?.amount, DOLLAR_DECIMALS)} {denomToSymbol(item.denom)}
            </div>
          </>
        ),
      }
    })


  const rebasingColumns = [
    {
      title: (
        <>
          No. of Weeks
        </>
      ),
      dataIndex: "epocId",
      key: "epocId",
      width: 150,
    },
    {
      title: (
        <>
          Rebase Amount <TooltipIcon text="Eligible Harbor rebase amount " />
        </>
      ),
      dataIndex: "rebaseAmount",
      key: "rebaseAmount",
      width: 250,
    },
    {
      title: (
        <>
          Action <TooltipIcon text="Action button to claim rebase" />
        </>
      ),
      dataIndex: "claim",
      key: "claim",
      width: 150,
      align: "right",
    },

  ];

  const rebasingTableData =
    claimableRebaseData && claimableRebaseData.length > 0 &&
    claimableRebaseData?.map((item) => {
      return (
        {
          key: item?.proposal_id,
          epocId: item?.proposal_id,
          rebaseAmount: (
            <>
              <div className="assets-withicon justify-content-center mr-2">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(
                      "uharbor"
                    )}
                  />
                </div>
                {amountConversionWithComma(item?.rebase_amount || 0)}
              </div>
            </>
          ),
          claim: (
            <Button
              type="primary"
              className="btn-filled"
              loading={item?.proposal_id === current ? loading : false}
              disabled={loading}
              onClick={() => claimRebase(item?.proposal_id)}
            >
              Claim
            </Button>
          )
        }
      )

    })

  return (


    <div className="app-content-wrapper">
      <Row>
        {/* Govern  */}
        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2> Earn</h2>
                <p>
                  Deposit $CMST to earn variable interest on it.
                </p>
                <div className="button-container same-button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("/more/earn")}
                  >
                    Earn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Airdrop  */}
        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Airdrop</h2>
                <p>
                  Perform tasks to claim your HARBOR airdrop.
                </p>
                <div className="button-container same-button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("./airdrop")}
                    disabled={true}
                  >
                    Airdrop
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* stake  */}
        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Stake</h2>
                <p>
                  Stake your Harbor token for veHarbor to benefit from increased voting power, rebases, external incentives and surplus rewards.
                </p>
                <div className="button-container same-button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("./vesting")}
                  >
                    Stake
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Vote  */}
        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Emission</h2>
                <p>
                  Vote for your desired vaults or liquidity pools to direct emissions to that specific vault/pool and receive external incentives. The voting on emissions will run every week.
                </p>
                <div className="button-container same-button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("./vote")}
                  >
                    Vote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Rewards  */}
        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Rewards</h2>
                <p>
                  Rewards displayed are an estimation of the external incentives and the rebases that you can claim.
                </p>
                <div className="button-container same-button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("./rewards")}
                  >
                    Claim
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Reward  */}
        {/* <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Rewards</h2>
                <p>
                  Rewards displayed are an estimation of the external incentives, surplus rewards and the rebases that you can claim.
                </p>
                <div className="button-container">
                  <Row>
                    <Col>
                      <Button
                        type="primary"
                        className="btn-filled"
                        onClick={showModal}
                      >
                        Claim Rewards
                      </Button>
                    </Col>

                    <Col>
                      <Button
                        type="primary"
                        className="btn-filled"
                        onClick={showRebasingModal}
                      >
                        Claim Rebase
                      </Button>
                    </Col>

                  </Row>



                  <Modal
                    centered={true}
                    className="palcebid-modal reward-collect-modal"
                    footer={null}
                    header={null}
                    open={isModalVisible}
                    width={550}
                    closable={true}
                    onOk={handleOk}
                    loading={loading}
                    onCancel={handleCancel}
                  >
                    <div className="palcebid-modal-inner rewards-modal-main-container">
                      <Row>
                        <Col>
                          <div className="rewards-title">
                            Claim Rewards
                          </div>
                        </Col>
                      </Row>

                      <Row style={{ paddingTop: 0 }}>
                        <Col>
                          <div className="card-content ">
                            <Table
                              className="custom-table liquidation-table"
                              dataSource={tableData}
                              columns={columns}
                              pagination={false}
                              scroll={{ x: "100%" }}
                              locale={{ emptyText: <NoDataIcon /> }}
                            />
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col className="diaplay-center flex">
                          <Button
                            type="primary"
                            className="btn-filled "
                            size="sm"
                            onClick={() => claimReward()}
                            loading={loading}
                            disabled={!claimableRewardsData?.length > 0}
                          >
                            Claim All
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Modal>

                </div>
              </div>
            </div>
          </div>
        </Col> */}

        {/* Rebasing  */}
        <div>
          <Modal
            centered={true}
            className="palcebid-modal reward-collect-modal"
            footer={null}
            header={null}
            open={isRebasingModalVisible}
            width={600}
            closable={true}
            onOk={handleRebasingOk}
            loading={loading}
            onCancel={handleRebasingCancel}
          >
            <div className="palcebid-modal-inner rewards-modal-main-container">
              <Row>
                <Col>
                  <div className="rewards-title">
                    Claim Rebase
                  </div>
                </Col>
              </Row>

              <Row style={{ paddingTop: 0 }}>
                <Col>
                  <div className="card-content ">
                    <Table
                      className="custom-table liquidation-table"
                      dataSource={rebasingTableData}
                      columns={rebasingColumns}
                      pagination={false}
                      scroll={{ x: "100%" }}
                      locale={{ emptyText: <NoDataIcon /> }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Modal>
        </div>


        {/* Stable Mint  */}
        {/* <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Stable Mint</h2>
                <p>
                  Swap between whitelisted stablecoins and $CMST
                </p>
                <div className="button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("./stableMint")}
                  >
                    Stable Mint
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col> */}

      </Row>
    </div>
  );
};

More.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
  };
};
const actionsToProps = {
  setBalanceRefresh,
};
export default connect(stateToProps, actionsToProps)(More);