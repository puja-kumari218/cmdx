import * as PropTypes from "prop-types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Col, Row, SvgIcon } from "../../../../components/common";
import { connect } from "react-redux";
import { Button, List, Spin } from "antd";
import "./index.scss";
import VoteNowModal from "../VoteNowModal";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { checkUserVote, fetchSpecificProposalData } from "../../../../services/contractsRead";
import { useEffect } from "react";
import { setCurrentProposal, setUserVote } from "../../../../actions/govern";
import { stringTagParser, truncateString } from "../../../../utils/string";
import Copy from "../../../../components/Copy";
import { useState } from "react";
import moment from "moment";
import { formatNumber } from "../../../../utils/number";
import { amountConversion, amountConversionWithComma } from "../../../../utils/coin";
import { DOLLAR_DECIMALS } from "../../../../constants/common";
import { totalVTokens } from "../../../../services/voteContractsRead";
import { MyTimer } from "../../../../components/TimerForAirdrop";
import TooltipIcon from "../../../../components/TooltipIcon";

const GovernDetails = ({
  lang,
  address,
  currentProposal,
  setCurrentProposal,
  userVote,
  setUserVote,
  voteCount,
}) => {
  const { proposalId } = useParams();
  let currentProposalId = Number(proposalId);
  const [loading, setLoading] = useState()
  const [getVotes, setGetVotes] = useState({
    yes: 0,
    no: 0,
    veto: 0,
    abstain: 0
  });
  const [totalVoteVotingPower, setVoteTotalVotingPower] = useState(0);



  const fetchSpecificProposal = (proposalId) => {
    fetchSpecificProposalData(proposalId).then((res) => {
      setCurrentProposal(res);
    }).catch((err) => {
    })
  }
  const fetchUserVote = (proposalId, address) => {
    setLoading(true)
    checkUserVote(proposalId, address).then((res) => {
      setUserVote(res.vote)
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
    })
  }

  const fetchTotalVTokens = (address, height) => {
    totalVTokens(address, height).then((res) => {
      setVoteTotalVotingPower(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  useEffect(() => {
    if (currentProposalId) {
      fetchSpecificProposal(currentProposalId)
    }
  }, [currentProposalId, voteCount])

  useEffect(() => {
    if (currentProposalId && address) {
      fetchUserVote(currentProposalId, address)
      if (currentProposal?.start_height) {
        fetchTotalVTokens(address, currentProposal?.start_height)
      }
    }
  }, [address, currentProposal])


  useEffect(() => {
    calculateVotes()
  }, [address, currentProposal])


  const calculateTotalValue = () => {
    let value = currentProposal?.votes;
    let yes = Number(value?.yes);
    let no = Number(value?.no);
    let veto = Number(value?.veto);
    let abstain = Number(value?.abstain);
    let totalValue = yes + no + abstain + veto
    totalValue = (totalValue / 1000000)
    totalValue = formatNumber(totalValue)
    return totalValue;
  }

  const calculateQuorem = () => {
    let value = currentProposal;
    let totalWeight = value?.total_weight;
    let quoremWeight = value?.threshold?.threshold_quorum?.quorum;
    let quorem = Number(totalWeight) * Number(quoremWeight);
    quorem = formatNumber(amountConversion(quorem, DOLLAR_DECIMALS))
    return quorem;

  }

  const calculateVotes = () => {
    let value = currentProposal?.votes;
    let yes = Number(value?.yes);
    let no = Number(value?.no);
    let veto = Number(value?.veto);
    let abstain = Number(value?.abstain);
    let totalValue = yes + no + abstain + veto;

    yes = Number(((yes / totalValue) * 100) || 0).toFixed(2)
    no = Number(((no / totalValue) * 100) || 0).toFixed(2)
    veto = Number(((veto / totalValue) * 100) || 0).toFixed(2)
    abstain = Number(((abstain / totalValue) * 100) || 0).toFixed(2)
    setGetVotes({
      ...getVotes,
      yes: yes,
      no: no,
      veto: veto,
      abstain: abstain
    })
  }

  const unixToGMTTime = (time) => {
    // *Removing miliSec from unix time 
    let newTime = Math.floor(time / 1000000000);
    var timestamp = moment.unix(newTime);
    timestamp = timestamp.format("DD-MM-YYYY ")
    return timestamp;
  }
  const votingStartTime = unixToGMTTime(currentProposal?.start_time);
  const votingEndTime = unixToGMTTime(currentProposal?.expires?.at_time);
  const duration = moment.duration(currentProposal?.duration?.time, 'seconds');

  let time = currentProposal?.expires?.at_time;
  time = (time / 1000000);



  const data = [
    {
      title: "Voting Starts",
      counts: votingStartTime !== "Invalid date" ? `${votingStartTime} ` : "--/--/-- 00:00:00"
    },
    {
      title: "Voting Ends",
      counts: votingEndTime !== "Invalid date" ? `${votingEndTime} ` : "--/--/-- 00:00:00"
    },
    {
      title: "Voting Ends In",
      counts: time !== "Invalid date" ? <MyTimer expiryTimestamp={time} /> : "--/--/-- 00:00:00"
    },
    {
      title: "Proposer",
      counts: currentProposal?.proposer ? <div className="flex "><span className="mr-2">{truncateString(currentProposal?.proposer, 6, 6)}</span><span><Copy text={currentProposal?.proposer} /></span> </div> : "------",

    }
  ];

  const dataVote = [
    {
      title: "Total Vote",
      counts: currentProposal ? `${(calculateTotalValue() || "0") + " " + "veHARBOR"}` : 0,
    },
    {
      title: "Quorum" + " " + "(" + (Number(currentProposal?.threshold?.threshold_quorum?.quorum || 0) * 100) + "%" + ")",
      counts: currentProposal ? `${(calculateQuorem() || "0") + " " + "veHARBOR"}` : 0,
    }
  ];

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 180,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    subtitle: {
      floating: true,
      style: {
        fontSize: "25px",
        fontWeight: "500",
        fontFamily: "Lexend Deca",
        color: "#fff",
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "120%",
        innerSize: "75%",
        borderWidth: 0,
        className: "totalvalue-chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "Yes",
            y: Number(getVotes?.yes || 0),
            color: "#03d707c4",
          },
          {
            name: "No",
            y: Number(getVotes?.no || 0),
            color: "#FF6767",
          },
          {
            name: "No With Veto",
            y: Number(getVotes?.veto || 0),
            color: "#C0C0C0",
          },
          {
            name: "Abstain",
            y: Number(getVotes?.abstain || 0),
            color: "#B699CA",
          },
        ],
      },
    ],
  };

  const getUserVote = (vote) => {
    if (vote === "veto") {
      return "No with veto"
    }
    else {
      return vote
    }
  }

  const parsedVotingStatustext = (text) => {
    if (text === "open") {
      return "voting Period"
    }
    return text;
  }

  if (loading) {
    return <div className="spinner"><Spin /></div>
  }
  return (
    <div className="app-content-wrapper">
      <Row>
        <Col className="text-right mb-3">
          <div className="govern-voting-power-container">
            <div className="total-veHARBOR">
              My Voting Power : <span className='fill-box'><span>{amountConversionWithComma(totalVoteVotingPower) || 0}</span> veHARBOR </span> <TooltipIcon text="Voting power will be calculated before the start of the voting period of this proposal" />
            </div>
          </div>
        </Col>

        <Col className="text-right mb-3">
          <Link to="/govern"><Button className="back-btn" type="primary">Back</Button></Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="composite-card myhome-upper earn-deposite-card d-block">
            <div className="card-header">
              PROPOSAL DETAILS
            </div>
            <div className="myhome-upper-left w-100">
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 4,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={data}
                renderItem={item => (
                  <List.Item>
                    <div>
                      <p>{item.title}</p>
                      <h3 className="claim-drop-amount">{item.counts}</h3>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>


      <Row className="govern-row-gap">
        <Col md="6">
          <div className="composite-card govern-card2 earn-deposite-card h-100">
            <Row className="inner-voting-status-main-container">
              <div className="proposal-id">
                <h3>#{currentProposal?.id || "-"}</h3>
              </div>
              <div className="proposal-status-container">
                <div className={currentProposal?.status === "open" ? "proposal-status open-color"
                  : currentProposal?.status === "passed" || currentProposal?.status === "executed" ? "proposal-status passed-color"
                    : currentProposal?.status === "rejected" ? "proposal-status reject-color"
                      : currentProposal?.status === "pending" ? "proposal-status pending-color" : "proposal-status"

                }> {currentProposal ? parsedVotingStatustext(currentProposal?.status) : "-" || "-"}</div>
              </div>
            </Row>
            <Row>
              <Col>
                <h2>{currentProposal?.title || "---"}</h2>
                <p>{stringTagParser(currentProposal?.description || " ") || "----"} </p>
              </Col>
            </Row>
          </div>
        </Col>
        <Col md="6">
          <div className="composite-card govern-card2 earn-deposite-card">
            <Row>
              {address && userVote !== null ?
                <Col className="text-right">
                  <div className="user-vote-container">
                    {userVote && <div>Your Vote : <span className={userVote?.vote === "yes" ? "vote_msg yes"
                      : userVote?.vote === "no" ? "vote_msg no"
                        : userVote?.vote === "veto" ? "vote_msg veto"
                          : userVote?.vote === "abstain" ? "vote_msg abstain" : "vote_msg"}

                    > {getUserVote(userVote?.vote)} </span>  </div>}
                    <VoteNowModal votingPower={amountConversionWithComma(totalVoteVotingPower) || 0} />
                  </div>
                </Col> :
                <Col className="text-right">
                  <VoteNowModal votingPower={amountConversionWithComma(totalVoteVotingPower) || 0} />
                </Col>
              }
            </Row>
            <Row>
              <Col>
                <div className="govern-dlt-card">

                  <List
                    grid={{
                      gutter: 16,
                      xs: 1,
                    }}
                    dataSource={dataVote}
                    renderItem={item => (
                      <List.Item>
                        <div>
                          <p>{item.title}</p>
                          <h3>{item.counts}</h3>
                        </div>
                      </List.Item>
                    )}
                  />
                  <div className="govern-dlt-right">
                    <ul className="vote-lists">
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>Yes</label>
                          <p>{getVotes?.yes || "0.00"}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>No</label>
                          <p>{getVotes?.no || 0}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>No With Veto </label>
                          <p>{getVotes?.veto || 0}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>Abstain</label>
                          <p>{getVotes?.abstain || 0}%</p>
                        </div>
                      </li>
                    </ul>
                    <div className="govern-dlt-chart">
                      <HighchartsReact highcharts={Highcharts} options={Options} />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

GovernDetails.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  currentProposal: PropTypes.array.isRequired,
  userVote: PropTypes.array.isRequired,
  voteCount: PropTypes.number.isRequired
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    currentProposal: state.govern.currentProposal,
    userVote: state.govern.userVote,
    voteCount: state.govern.voteCount,
  };
};

const actionsToProps = {
  setCurrentProposal,
  setUserVote,
};

export default connect(stateToProps, actionsToProps)(GovernDetails);
