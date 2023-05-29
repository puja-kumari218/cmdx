import React, { useEffect, useState } from 'react'
import { Col, Row, SvgIcon } from "../../../components/common";
import './index.scss';
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Input, message, Slider, Switch, Table } from "antd";
import { Link } from 'react-router-dom';
import NoDataIcon from '../../../components/common/NoDataIcon';
import ExternalIncentivesModal from './ExternalIncentivesModal';
import { setBalanceRefresh } from "../../../actions/account";


import cardImage from '../../../assets/images/reward-bg.jpg';
import { DOLLAR_DECIMALS, PRODUCT_ID } from '../../../constants/common';
import { claimableRewards } from '../../../services/rewardContractsWrite';
import { amountConversionWithComma } from '../../../utils/coin';
import { denomToSymbol, iconNameFromDenom } from '../../../utils/string';
import ViewAllToolTip from '../Vote/viewAllModal';
import { totalClaimableRebase } from '../../../services/rebasingContractRead';
import { comdex } from '../../../config/network';
import variables from '../../../utils/variables';
import Snack from '../../../components/common/Snack';
import { transactionForClaimRebase } from '../../../services/rebaseingContractWrite';
import { transactionClaimAllRewards, transactionClaimRewards } from '../../../services/rewardContractsRead';
import { setLockActiveTab } from "../../../actions/vesting";
import TooltipIcon from '../../../components/TooltipIcon';

const Rewards = ({
  lang,
  address,
  refreshBalance,
  setBalanceRefresh,
  setLockActiveTab
}) => {
  const [claimableRewardsData, setClaimableRewardsData] = useState()
  const [loading, setLoading] = useState(false);
  const [allRewardLoading, setAllRewardLoading] = useState(false);
  const [claimableRebaseData, setClaimableRebaseData] = useState()
  const [current, setCurrent] = useState(0);
  const [rewardCurrent, setRewardCurrent] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [disbaleClaimAll, setDisableClaimAll] = useState(true)




  // Query 
  const fetchClaimeableRewards = (productId, address) => {
    setDataLoading(true)
    claimableRewards(productId, address).then((res) => {
      setClaimableRewardsData(res?.reverse())
      setDataLoading(false)
    }).catch((error) => {
      console.log(error);
      setDataLoading(false)
    })
  }

  const fetchClaimeableRebase = (productId, address) => {
    setDataLoading(true)
    totalClaimableRebase(productId, address).then((res) => {
      setClaimableRebaseData(res?.reverse())
      setDataLoading(false)
    }).catch((error) => {
      console.log(error);
      setDataLoading(false)
    })
  }

  // UseEffect calls 
  useEffect(() => {
    if (address) {
      fetchClaimeableRewards(PRODUCT_ID, address)
      fetchClaimeableRebase(PRODUCT_ID, address)
    }
  }, [address, refreshBalance])

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

  const claimReward = (proposalId) => {
    setRewardCurrent(proposalId)
    setLoading(true)
    if (address) {
      transactionClaimRewards(address, PRODUCT_ID, proposalId, (error, result) => {
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

  const claimAllReward = () => {
    setAllRewardLoading(true)
    setLoading(true)
    if (address) {
      transactionClaimAllRewards(address, PRODUCT_ID, (error, result) => {
        if (error) {
          message.error(error?.rawLog || "Transaction Failed")
          setAllRewardLoading(false)
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
        setAllRewardLoading(false)
        setLoading(false)
      })
    }
    else {
      setAllRewardLoading(false)
      setLoading(false)
      message.error("Please Connect Wallet")
    }
  }

  const externalIncentivesColumns = [
    {
      title: 'Week',
      dataIndex: "week",
      key: "week",
      align: 'left'
    },
    {
      title: 'Assets',
      dataIndex: "assets",
      key: "assets",
      align: "left",
      render: (item) => (
        <>
          {item?.length > 0 ?
            (item?.length == 1) ?
              <div className="bribe-container mt-1" >
                <span className="assets-withicon">
                  <span className="assets-icon">
                    <SvgIcon
                      name={iconNameFromDenom(item[0]?.denom)}
                    />
                  </span>
                </span>
                <span>{amountConversionWithComma(item[0]?.amount, comdex?.coinDecimals)} {denomToSymbol(item[0]?.denom)} </span>

              </div>
              : (
                <div className="bribe-container mt-1" >
                  <span className="assets-withicon">
                    <span className="assets-icon">
                      <SvgIcon
                        name={iconNameFromDenom(item[0]?.denom)}
                      />
                    </span>
                  </span>
                  <span>{amountConversionWithComma(item[0]?.amount, DOLLAR_DECIMALS)} {denomToSymbol(item[0]?.denom)} </span>
                  <span> <ViewAllToolTip btnText={"View All"} bribes={item} /></span>
                </div>
              )
            : <div className="mt-1" >Not Eligible for External Incentives</div>
          }

        </>
      ),
    },
    {
      title: 'Action',
      dataIndex: "action",
      key: "action",
      align: 'center',
      className: 'justify-content-center',
      render: (item) => <>
        {
          item?.total_incentive?.length === 0 ? "" :
            !item?.claimed ?
              <Button type='primary'
                className='btn-filled px-4'
                onClick={() => claimReward(item?.proposal_id)}
                loading={item?.proposal_id === rewardCurrent ? loading : false}
                disabled={
                  loading ||
                  item?.total_incentive?.length <= 0

                }
              >
                Claim
              </Button>
              :
              <div className='claimed-tag'><SvgIcon name='check-circle' viewbox='0 0 15 15' /> Claimed</div>

        }
      </>,
      width: 140
    }
  ];



  const externalIncentivesdata = claimableRewardsData && claimableRewardsData?.map((item) => {
    return {
      key: item?.proposal_id,
      week: item?.proposal_id,
      assets: item?.total_incentive,
      action: item
    }

  })

  const emissionRewardsColumns = [
    {
      title: 'Week',
      dataIndex: "week",
      key: "week",
      align: 'left'
    },
    {
      title: 'Assets',
      dataIndex: "assets",
      key: "assets",
      align: "left",
      render: (item) => (
        <>
          {item === "0" ? <div div className="mt-1" >Not Eligible for HARBOR Emissions</div> :
            <div className="bribe-container mt-1" >
              <span className="assets-withicon">
                <span className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom("uharbor")}
                  />
                </span>
              </span>
              <span>{amountConversionWithComma(item, comdex?.coinDecimals)} {denomToSymbol("uharbor")} </span>

            </div>
          }
        </>
      ),
    },
    {
      title: 'Action',
      dataIndex: "action",
      key: "action",
      align: 'center',
      className: 'justify-content-center',
      render: (item) => <>
        {
          item?.rebase === "0" ? "" :
            !item?.claimed ?
              <Button type='primary'
                className='btn-filled px-4'
                onClick={() => claimRebase(item?.proposal_id)}
                loading={item?.proposal_id === current ? loading : false}
                disabled={loading}
              >
                Claim
              </Button>
              :
              <div className='claimed-tag'><SvgIcon name='check-circle' viewbox='0 0 15 15' /> Claimed</div>
        }
      </>,
      width: 140
    }
  ];



  const emissionRewardsdata = claimableRebaseData && claimableRebaseData?.map((item) => {
    return {
      key: item?.proposal_id,
      week: item?.proposal_id,
      assets: item?.rebase,
      action: item
    }
  })

  useEffect(() => {
    if (claimableRewardsData) {
      let data = claimableRewardsData && claimableRewardsData?.filter((item) => {
        if (item?.claimed === false && item?.total_incentive?.length > 0) {
          return true;
        }
        return false;
      });

      if (data?.length === 0) {
        setDisableClaimAll(true);
      } else {
        setDisableClaimAll(false);
      }
    }
  }, [claimableRewardsData])



  return (
    <>
      <div className="app-content-wrapper">
        <Row>
          <Col>
            <div className="totol-voting-main-container mb-3">
              <div className='d-flex total-voting-power-tooltip-box'></div>
              <div>
                <Link to="/more"><Button className="back-btn" type="primary">Back</Button></Link>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className='reward-card' style={{ backgroundImage: `url(${cardImage})` }}>
              <h2>Rebase Rewards </h2>
              <p>$veHarbor is distributed to $veHARBOR holders in order to reduce the voting power dilution. Users can see their $veHarbor here.</p>
              <Link to="/more/vesting">
                <Button type='primary'
                  className='btn-filled'
                  onClick={() => {
                    setLockActiveTab(true)
                  }
                  }
                >Take me there!</Button>
              </Link>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md='6'>
            <Row className='mb-2'>
              <Col >
                <h2 className='incentives-heading'>Rebase Rewards <TooltipIcon text="You will receive these rewards at the end of the weekly emissions, and after claiming them, they will be staked." /></h2>
              </Col>
            </Row>
            <Table
              className="custom-table reward-table"
              dataSource={emissionRewardsdata}
              columns={emissionRewardsColumns}
              pagination={false}
              loading={dataLoading}
              scroll={{ x: "100%" }}
              locale={{ emptyText: <NoDataIcon /> }}
            />
          </Col>
          <Col md='6'>
            <Row className='mb-2'>
              <Col>
                <h2 className='incentives-heading'>External Incentives <TooltipIcon text="You will receive these incentives if you have voted on any vault/pool that had external incentives during the voting period" /> </h2>
              </Col>
              <Col className="text-right" style={{ flexGrow: "unset" }}>
                <Button type='primary'
                  className='btn-filled'
                  loading={allRewardLoading}
                  disabled={
                    allRewardLoading
                    || loading
                    || !address
                    || disbaleClaimAll
                  }
                  onClick={() => claimAllReward()}>
                  Claim All
                </Button>
              </Col>
            </Row>
            <Table
              className="custom-table reward-table"
              dataSource={externalIncentivesdata}
              columns={externalIncentivesColumns}
              pagination={false}
              loading={dataLoading}
              scroll={{ x: "100%" }}
              locale={{ emptyText: <NoDataIcon /> }}
            />
          </Col>

        </Row>
      </div>
    </>
  )
}

// export default Rewards;
Rewards.propTypes = {
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
  setLockActiveTab,
};
export default connect(stateToProps, actionsToProps)(Rewards);