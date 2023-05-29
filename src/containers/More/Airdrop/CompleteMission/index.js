import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../../components/common";
import { connect } from "react-redux";
import { Button, message, Steps, Table } from "antd";
import "./index.scss";
import TooltipIcon from "../../../../components/TooltipIcon";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { airdropMissionBorrow, airdropMissionLiquidity, airdropMissionMint, airdropMissionVote, checkEligibility, claimHarbor, claimveHarbor, timeLeftToClaim, unClaimHarbor, unClaimveHarbor } from "../../../../services/airdropContractRead";
import { useEffect } from "react";
import { useState } from "react";
import { amountConversionWithComma } from "../../../../utils/coin";
import { unixToGMTTime } from "../../../../utils/string";
import { MyTimer } from "../../../../components/TimerForAirdrop";
import { setuserEligibilityData } from "../../../../actions/airdrop";
import { missions } from "./mission";
import { setBalanceRefresh } from "../../../../actions/account";
import { transactionForClaimActivityMission, transactionForClaimAllActivityMission, transactionForClaimLiquidHarbor } from "../../../../services/airdropContractWrite";
import Snack from "../../../../components/common/Snack";
import variables from "../../../../utils/variables";
import { comdex } from "../../../../config/network";
import NoDataIcon from "../../../../components/common/NoDataIcon";


const { Step } = Steps;

const CompleteMission = ({
  lang,
  address,
  userEligibilityData,
  setuserEligibilityData,
  refreshBalance,
  setBalanceRefresh
}) => {

  const { chainId } = useParams();

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [counterEndTime, setCounterEndTime] = useState(0);
  const [userClaimHarbor, setUserClaimHarbor] = useState(0);
  const [userUnClaimHarbor, setUserUnClaimHarbor] = useState(0);
  const [userClaimveHarbor, setUserClaimveHarbor] = useState(0);
  const [userUnClaimveHarbor, setUserUnClaimveHarbor] = useState(0);
  const [loadingClaimAll, setLoadingClaimAll] = useState(false);
  const [checkClaimAllBtnDisable, setCheckAllBtnDisable] = useState(true);
  const [updateAllQuery, setUpdateAllQuery] = useState(0);
  const [airdropMission, setAirdropMission] = useState({
    liquid: true,
    mint: false,
    vote: false,
    borrow: false,
    liquidity: false,
  })

  // Query 

  const fetchTimeLeftToClaim = () => {
    timeLeftToClaim().then((res) => {
      setTotalTimeLeft(res)
    }).catch((error) => {
      console.log(error);
    })
  }
  const fetchCheckEligibility = (address, chainId) => {
    setLoading(true)
    checkEligibility(address, chainId).then((res) => {
      setuserEligibilityData(res)
      setLoading(false)
    }).catch((error) => {
      console.log(error);
      setLoading(false)
    })
  }

  const fetchClaimHarbor = (address, chainId) => {
    claimHarbor(address, chainId).then((res) => {
      setUserClaimHarbor(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchClaimveHarbor = (address, chainId) => {
    claimveHarbor(address, chainId).then((res) => {
      setUserClaimveHarbor(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchUnClaimHarbor = (address, chainId) => {
    unClaimHarbor(address, chainId).then((res) => {
      setUserUnClaimHarbor(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchUnClaimveHarbor = (address, chainId) => {
    unClaimveHarbor(address, chainId).then((res) => {
      setUserUnClaimveHarbor(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchAirdropMissionMint = (address) => {
    airdropMissionMint(address).then((res) => {
      setAirdropMission((prevState) => ({ ...prevState, ["mint"]: res }))
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchAirdropMissionVote = (address) => {
    airdropMissionVote(address).then((res) => {
      setAirdropMission((prevState) => ({ ...prevState, ["vote"]: res }))
    }).catch((error) => {
      console.log(error, "vote error");
    })
  }

  const fetchAirdropMissionLiquidity = (address) => {
    airdropMissionLiquidity(address).then((res) => {
      setAirdropMission((prevState) => ({ ...prevState, ["liquidity"]: res }))
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchAirdropMissionBorrow = (address) => {
    airdropMissionBorrow(address).then((res) => {
      setAirdropMission((prevState) => ({ ...prevState, ["borrow"]: res }))
    }).catch((error) => {
      console.log(error);
    })
  }

  const checkEligiblityOfClaimAllButton = () => {
    let allMission = airdropMission;
    let disable = true;
    for (var key of Object.keys(allMission)) {
      if (allMission[key]) {
        disable = false;
      }
    }
    setCheckAllBtnDisable(disable);
    return disable;
  }

  const checkCalculateCompletedMissionStape = () => {
    let MissionClaimeArray = userEligibilityData?.claimed;
    MissionClaimeArray = MissionClaimeArray?.filter(Boolean).length;
    setCurrentStep(MissionClaimeArray - 1)
  }

  const calculateMissionPercentage = () => {
    let MissionClaimeArray = userEligibilityData?.claimed;
    let MissionClaimeArrayLength = MissionClaimeArray?.length;
    MissionClaimeArray = MissionClaimeArray?.filter(Boolean).length;
    MissionClaimeArray = (MissionClaimeArray / MissionClaimeArrayLength) * 100;
    return MissionClaimeArray || 0;
  }


  const handleClaimMissionReward = (address, chainId, activity, currentId) => {
    setCurrent(currentId)
    setLoading(true)
    if (address) {
      if (activity === "liquid") {
        transactionForClaimLiquidHarbor(address, chainId, (error, result) => {
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
          setUpdateAllQuery(updateAllQuery + 1);
          setLoading(false)
        })
      } else {
        transactionForClaimActivityMission(address, chainId, activity, (error, result) => {
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
          setUpdateAllQuery(updateAllQuery + 1);
          setLoading(false)
        })
      }


    }
    else {
      setLoading(false)
      message.error("Please Connect Wallet")
    }
  }

  const claimAllActivityMission = (address, chainId) => {
    setLoadingClaimAll(true)
    if (address) {
      transactionForClaimAllActivityMission(address, chainId, (error, result) => {
        if (error) {
          setLoadingClaimAll(false)
          message.error(error?.rawLog || "Transaction Failed")

          return;
        }
        message.success(
          < Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex?.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        )
        setUpdateAllQuery(updateAllQuery + 1);
        setLoadingClaimAll(false)
      })
    } else {
      setLoadingClaimAll(false)
      message.error("Please Connect Wallet")
    }
  }


  useEffect(() => {
    fetchTimeLeftToClaim()
    if (address && Number(chainId)) {
      fetchCheckEligibility(address, Number(chainId))
      fetchClaimHarbor(address, Number(chainId))
      fetchClaimveHarbor(address, Number(chainId))
      fetchUnClaimveHarbor(address, Number(chainId))
      fetchUnClaimHarbor(address, Number(chainId))
    }
  }, [address, chainId, updateAllQuery])

  useEffect(() => {
    if (address) {
      fetchAirdropMissionMint(address)
      fetchAirdropMissionVote(address)
      fetchAirdropMissionLiquidity(address)
      fetchAirdropMissionBorrow(address)
    }
  }, [address, refreshBalance, updateAllQuery])

  useEffect(() => {
    checkCalculateCompletedMissionStape()
    calculateMissionPercentage()
  }, [address, userEligibilityData, refreshBalance])


  useEffect(() => {
    if (totalTimeLeft) {
      setCounterEndTime(unixToGMTTime(totalTimeLeft))
    }
  }, [totalTimeLeft, updateAllQuery])

  useEffect(() => {
    checkEligiblityOfClaimAllButton()
  }, [airdropMission, updateAllQuery])


  const time = new Date(counterEndTime);
  time.setSeconds(time.getSeconds());

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
      width: 120,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      align: "right",
      render: (item, index) =>
        <>
          {item?.path && <a href={item?.path} target="_blank"> <Button className="ml-3" type="primary" disabled={item?.disable}>Take me there</Button></a>}
          <Button type="primary"
            disabled={
              loading
              || !userEligibilityData
              || userEligibilityData && userEligibilityData?.claimed?.[item?.id - 1]
              || !airdropMission[item?.name]
              || loadingClaimAll
            }
            loading={item?.id === current ? loading : false}
            className="btn-filled ml-3"
            style={{ width: "118px" }}
            onClick={() => {
              handleClaimMissionReward(address, Number(chainId), item?.name, item?.id)
            }
            }>
            {userEligibilityData && userEligibilityData?.claimed?.[item?.id - 1] ? "Claimed" : "Claim"}
          </Button>
        </>
    },
  ];

  const tableData =
    missions && missions?.map((item, index) => {
      return {
        key: item?.id,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="left-icon"><SvgIcon name={item?.icon} viewbox={item?.viewBox} /></div>
              {item?.title} {"  "}
              <span className="ml-1">{item?.id === 3 && <TooltipIcon text="Users will be able to receive this airdrop if they had some (voting power) veharbor before the proposal was raised. New proposals will be raised every 2-3 days." />}</span>
            </div>
          </>
        ),
        action: item, index
      }
    })


  return (
    <div className="app-content-wrapper">
      <Row className="text-right">
        <Col>
          <Link to="/more/airdrop"><Button type="primary" className="btn-filled px-4">Back</Button></Link>
        </Col>
      </Row>
      <Row className="complete-mission-main-container">
        <Col className="mt-4 left-column">
          <div className="mission-card claim-airdrop-card">
            <div className="claim-airdrop-head">
              <h2>Claim Airdrop</h2>
              {/* <div className="head-right">
                {counterEndTime ? <MyTimer expiryTimestamp={time} text={"Ends in "} />
                  :
                  <div><span>Time Left</span> 0 <small>D</small> 0 <small>H</small> 0 <small>M</small> 0 <small>S</small>  </div>
                }
              </div> */}
            </div>
            <Row>
              <Col md='6'>
                <div className="airdrop-statics">
                  <p className="total-value">Claimed Harbor  <TooltipIcon text="Harbor Airdrop  which has been claimed" /></p>
                  <h2>{amountConversionWithComma(userClaimHarbor || 0)} <br /> <sub className="text-uppercase">harbor</sub></h2>
                </div>
              </Col>
              <Col md='6'>
                <div className="airdrop-statics">
                  <p className="total-value">Unclaimed Harbor  <TooltipIcon text="Unclaimed Harbor Tokens" /></p>
                  <h2>{amountConversionWithComma(userUnClaimHarbor || 0)} <sub className="text-uppercase">harbor</sub></h2>
                </div>
              </Col>
              <Col md='6'>
                <div className="airdrop-statics">
                  <p className="total-value">Claimed veHarbor  <TooltipIcon text="veHarbor that can be claimed  after  4 months upon completion of task" /></p>
                  <h2>{amountConversionWithComma(userClaimveHarbor || 0)} <sub>ve</sub><sub className="text-uppercase">harbor</sub></h2>
                </div>
              </Col>
              <Col md='6'>
                <div className="airdrop-statics">
                  <p className="total-value">Unclaimed veHarbor  <TooltipIcon text="Unclaimed  veHarbor will be claimable after completing the Missions" /></p>
                  <h2>{amountConversionWithComma(userUnClaimveHarbor || 0)} <sub>ve</sub><sub className="text-uppercase">harbor</sub></h2>
                </div>
              </Col>

            </Row>
          </div>
        </Col>

        <Col className="mt-4 right-column">
          <div className="mission-card progress-card">
            <div className="progress-airdrop-head">
              <h2>Your Progress</h2>
              <div className="head-right">{userEligibilityData && calculateMissionPercentage() || 0}% Complete</div>
            </div>
            <div className="mt-4 pt-3">
              <Steps size="small" current={currentStep} labelPlacement="vertical" icon={<SvgIcon name="plane-icon" viewbox="0 0 54 50" />} >
                <Step title="20%" key={0} icon={currentStep === 0 ? <SvgIcon name="plane-icon" viewbox="0 0 54 50" /> : ""} />
                <Step title="40%" key={1} icon={currentStep === 1 ? <SvgIcon name="plane-icon" viewbox="0 0 54 50" /> : ""} />
                <Step title="60%" key={2} icon={currentStep === 2 ? <SvgIcon name="plane-icon" viewbox="0 0 54 50" /> : ""} />
                <Step title="80%" key={3} icon={currentStep === 3 ? <SvgIcon name="plane-icon" viewbox="0 0 54 50" /> : ""} />
                <Step title="100%" key={4} icon={currentStep === 4 ? <SvgIcon name="plane-icon" viewbox="0 0 54 50" /> : ""} />
              </Steps>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <div className="mission-claim-main-container">
            <h2 className="mission-title">Mission</h2>
            <div className="claimAll-button">
              <Button type="primary" className="btn-filled "
                loading={loadingClaimAll}
                style={{ width: "118px" }}
                // disabled={
                //   loading
                //   || !userEligibilityData
                //   || checkClaimAllBtnDisable
                //   || loadingClaimAll
                // }
                disabled={true}
                onClick={() => claimAllActivityMission(address, Number(chainId))}>
                Claim All
              </Button>
            </div>
          </div>
          <div className="composite-card pb-3">
            <div className="card-content">
              <Table
                className="custom-table mission-table"
                dataSource={tableData}
                columns={columns}
                pagination={false}
                showHeader={false}
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

CompleteMission.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  userEligibilityData: PropTypes.object.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
    userEligibilityData: state.airdrop.userEligibilityData,
  };
};

const actionsToProps = {
  setuserEligibilityData,
  setBalanceRefresh,
};

export default connect(stateToProps, actionsToProps)(CompleteMission);