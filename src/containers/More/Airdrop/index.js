import { Button, Input, message, Modal } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from "highcharts/highcharts-more";
import solidGauge from "highcharts/modules/solid-gauge";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { connect } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  setuserComdexEligibilityData,
  setuserEligibilityData
} from "../../../actions/airdrop";
import MissonCardBg from "../../../assets/images/card-bg.jpg";
import AKASH_ICON from "../../../assets/images/icons/AKASH.png";
import ATOM_ICON from "../../../assets/images/icons/ATOM.png";
import AXELAR_ICON from "../../../assets/images/icons/AXELAR.png";
import COMDEX_ICON from "../../../assets/images/icons/COMDEX.png";
import CRESENT_ICON from "../../../assets/images/icons/CRESENT.png";
import HUAHUA_ICON from "../../../assets/images/icons/HUAHUA.png";
import JUNO_ICON from "../../../assets/images/icons/JUNO.png";
import KAVA_ICON from "../../../assets/images/icons/Kava.png";
import KUJIRA_ICON from "../../../assets/images/icons/KUJIRA.png";
import MNTL_ICON from "../../../assets/images/icons/MNTL.png";
import OSMO_ICON from "../../../assets/images/icons/OSMO.png";
import REGEN_ICON from "../../../assets/images/icons/REGEN.png";
import SIFCHAIN_ICON from "../../../assets/images/icons/SIFCHAIN.png";
import STARGAZE_ICON from "../../../assets/images/icons/STARGAZE.png";
import STATOM_ICON from "../../../assets/images/icons/STATOM.png";
import UMEE_ICON from "../../../assets/images/icons/UMEE.png";
import XKI_ICON from "../../../assets/images/icons/XKI.png";
import PlanePic from "../../../assets/images/plane-img.svg";
import celebrationAnimation from "../../../assets/lottefiles/74680-confetti.json";
import { Col, Row, SvgIcon } from "../../../components/common";
import TooltipIcon from "../../../components/TooltipIcon";
import {
  DEFAULT_CHAIN_ID_FOR_CLAIM_AIRDROP,
  TOTAL_ACTIVITY,
  TOTAL_VEHARBOR_ACTIVITY
} from "../../../constants/common";
import {
  checkEligibility,
  checkTotalEligibility,
  timeLeftToClaim,
  totalStatsOFClaimedData
} from "../../../services/airdropContractRead";
import { eligibilityCheckTracker } from "../../../services/airdropEligiblityTracker";
import {
  amountConversion,
  amountConversionWithComma
} from "../../../utils/coin";
import { formatNumber } from "../../../utils/number";
import { unixToGMTTime } from "../../../utils/string";
import ChainModal from "./ChainModal";
import "./index.scss";
import { maginTxChain } from "./magicTxChain";

highchartsMore(Highcharts);
solidGauge(Highcharts);

const Airdrop = ({
  lang,
  address,
  isDarkMode,
  refreshBalance,
  userEligibilityData,
  setuserEligibilityData,
  userComdexEligibilityData,
  setuserComdexEligibilityData,
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [counterEndTime, setCounterEndTime] = useState(0);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [totalClaimedHarbor, setTotalClaimedHarbor] = useState(0);
  const [totalClaimedveHarbor, setTotalClaimedveHarbor] = useState(0);
  const [claimAllEligibility, setClaimAllEligibility] = useState(false);
  const [totalEligibleToken, setTotalEligibletoken] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [userComdexAddress, setUserComdexAddress] = useState(address);
  const [calculatedSupplyPercentage, setCalculatedSupplyPercentage] =
    useState(0);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: celebrationAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleEligiblityModalCancel = () => {
    setIsEligibilityModalOpen(false);
  };

  const shareText = `
Hi Guys! %0A
I am eligible for the $HARBOR airdrop by @Harbor_Protocol🤩 %0A %0A

You may also check your eligibility for the airdrop via👇
https://app.harborprotocol.one/more/airdrop  %0A%0A

Harbor Protocol is the Interchain Stablecoin Protocol built on the @ComdexOfficial chain. %0A %0A

$HARBOR   $CMST`;

  // Query
  const fetchTimeLeftToClaim = () => {
    timeLeftToClaim()
      .then((res) => {
        setTotalTimeLeft(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchCheckEligibility = (address, chainId) => {
    setLoading(true);
    checkEligibility(address, chainId)
      .then((res) => {
        setClaimAllEligibility(res);
        setuserComdexEligibilityData(res);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const fetchCheckTotalEligibility = (address) => {
    setLoading(true);
    checkTotalEligibility(address)
      .then((res) => {
        setTotalEligibletoken(res);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const fetchTotalStatsOFClaimedData = () => {
    totalStatsOFClaimedData()
      .then((res) => {
        setTotalAllocation(res?.total_allocated);
        setTotalClaimedHarbor(res?.total_harbor_claimed);
        setTotalClaimedveHarbor(res?.total_ve_harbor_claimed);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleClaimAll = () => {
    if (address) {
      setIsEligibilityModalOpen(true);
    } else {
      message.error("Please connect wallet!");
    }
  };

  const handleCheckComdexEligibility = () => {
    if (address) {
      fetchCheckEligibility(
        userComdexAddress,
        DEFAULT_CHAIN_ID_FOR_CLAIM_AIRDROP
      );
      eligibilityCheckTracker(
        DEFAULT_CHAIN_ID_FOR_CLAIM_AIRDROP,
        userComdexAddress,
        (error, result) => {
          if (error) {
            console.log(error, "Eligibility Request");
            return;
          }
        }
      );
      if (userComdexEligibilityData) {
        fetchCheckTotalEligibility(userComdexAddress);
        setIsEligibilityModalOpen(false);
        setIsOpen(true);
      } else {
        message.error("Sorry you are not Eligible! 🙁");
      }
    } else {
      message.error("Please connect  wallet!");
    }
  };

  useEffect(() => {
    if (totalTimeLeft) {
      setCounterEndTime(unixToGMTTime(totalTimeLeft));
    }
  }, [totalTimeLeft]);

  useEffect(() => {
    fetchTimeLeftToClaim();
    fetchTotalStatsOFClaimedData();
    setClaimAllEligibility(false);
  }, [address]);

  useEffect(() => {
    setUserComdexAddress(address);
  }, [address]);

  useEffect(() => {
    fetchCheckEligibility(
      userComdexAddress,
      DEFAULT_CHAIN_ID_FOR_CLAIM_AIRDROP
    );
  }, [isEligibilityModalOpen, userComdexAddress]);

  useEffect(() => {
    fetchCheckTotalEligibility(address);
  }, [address, userComdexAddress]);

  const time = new Date(counterEndTime);
  time.setSeconds(time.getSeconds());

  const calculatedDistributedHarbor = () => {
    let claimedharbor = Number(amountConversion(totalClaimedHarbor || 0));
    let claimedVeHarbor = Number(amountConversion(totalClaimedveHarbor || 0));
    let totalSupply = Number(amountConversion(totalAllocation || 0));
    let calculatePercentage =
      ((claimedharbor + claimedVeHarbor) / totalSupply) * 100;
    return calculatePercentage || 0;
  };

  const options = {
    chart: {
      type: "solidgauge",
      height: "190",
      backgroundColor: null,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    tooltip: {
      enabled: false,
    },
    pane: {
      center: ["50%", "50%"],
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || "#36434E",
        innerRadius: "60%",
        outerRadius: "100%",
        shape: "arc",
        borderWidth: 0,
      },
    },

    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickPositions: [],
    },

    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true,
        },
      },
    },

    series: [
      {
        data: [
          {
            color: "#DED0E7",
            radius: "100%",
            y: calculatedDistributedHarbor(),
          },
        ],
        dataLabels: {
          format:
            '<div style="text-align:center; margin-top: -15px;">' +
            `<span style="font-size:15px" class="total-supply">${formatNumber(
              amountConversion(totalAllocation || 0)
            )}</span>` +
            "</div>",
        },
      },
    ],
  };

  useEffect(() => {
    calculatedDistributedHarbor();
  }, [totalClaimedHarbor, totalClaimedveHarbor, totalAllocation]);

  return (
    <div className="app-content-wrapper">
      <Row className="text-right">
        <Col>
          <Link to="/more">
            <Button type="primary" className="btn-filled px-4">
              Back
            </Button>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="time-left-head">
            <div className="left-text">
              <div style={{ display: "flex" }}>
                <div>
                  {" "}
                  <b>AIRDROP HAS ENDED</b>{" "}
                </div>
              </div>
            </div>
          </div>
          <Row className="airdrop-upper pt-2">
            <Col xl="4" lg="12">
              <div className="airdrop-upper-card airdrop-upper-card1">
                <h2>Airdrop Details </h2>
                <div className="total-airdrop">
                  <p>Total Airdrop</p>
                  <HighchartsReact highcharts={Highcharts} options={options} />
                </div>
                <div className="airdrop-statics mt-n4">
                  <p className="total-value">
                    Total Claimed $Harbor Airdrop{" "}
                    <TooltipIcon text="Airdrop  which has been claimed across all chains and liquidity pools" />
                  </p>
                  <h2>
                    {amountConversionWithComma(totalClaimedHarbor || 0)}{" "}
                    <sub className="text-uppercase">harbor</sub>
                  </h2>
                </div>
                <div className="airdrop-statics mb-0">
                  <p className="total-value">
                    Total Claimed $veHarbor{" "}
                    <TooltipIcon text="$veHarbor claimed across all chains and liquidity pools after completing the missions with a locking period of 4 months" />
                  </p>
                  <h2>
                    {amountConversionWithComma(totalClaimedveHarbor || 0)}{" "}
                    <sub>ve</sub>
                    <sub className="text-uppercase">harbor</sub>
                  </h2>
                </div>
              </div>
            </Col>
            <Col xl="4" lg="6">
              <div className="airdrop-upper-card airdrop-upper-card2">
                <h3>
                  Airdrop for Chains with Magic Txn{" "}
                  <TooltipIcon text="Users need to perform the Magic Txn for every individual chain listed below to receive there airdrop which will get distributed to their Comdex address." />
                </h3>
                <ul>
                  {maginTxChain?.map((item) => {
                    return (
                      <li key={item?.chainId}>
                        <ChainModal currentChain={item} />
                        <p>{item?.chainName} </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="text-center mt-auto">
                  <Button
                    type="primary"
                    className="different-chain-eligibility"
                  >
                    Click on different chains to check eligibility and complete
                    missions
                  </Button>
                </div>
              </div>
            </Col>
            <Col xl="4" lg="6">
              <div className="airdrop-upper-card airdrop-upper-card3">
                <h3>
                  Airdrop for below Chains{" "}
                  <TooltipIcon text="$Harbor and $veHarbor airdrop has been distributed to users for below chains and pools. Users need to complete missions to claim it." />
                </h3>
                <ul>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={AKASH_ICON} alt="" />
                      </div>
                    </div>
                    <p>AKT</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={ATOM_ICON} alt="" />
                      </div>
                    </div>
                    <p>ATOM</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={AXELAR_ICON} alt="" />
                      </div>
                    </div>
                    <p>AXL</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={COMDEX_ICON} alt="" />
                      </div>
                    </div>
                    <p>CMDX</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={CRESENT_ICON} alt="" />
                      </div>
                    </div>
                    <p>CRE</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={JUNO_ICON} alt="" />
                      </div>
                    </div>
                    <p>JUNO</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={XKI_ICON} alt="" />
                      </div>
                    </div>
                    <p>XKI</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={OSMO_ICON} alt="" />
                      </div>
                    </div>
                    <p>OSMO</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={REGEN_ICON} alt="" />
                      </div>
                    </div>
                    <p>REGEN</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={SIFCHAIN_ICON} alt="" />
                      </div>
                    </div>
                    <p>ROWAN</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={STARGAZE_ICON} alt="" />
                      </div>
                    </div>
                    <p>STARS</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={UMEE_ICON} alt="" />
                      </div>
                    </div>
                    <p>UMEE</p>
                  </li>
                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={KUJIRA_ICON} alt="" />
                      </div>
                    </div>
                    <p>KUJI</p>
                  </li>

                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={HUAHUA_ICON} alt="" />
                      </div>
                    </div>
                    <p>HUAHUA</p>
                  </li>

                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={KAVA_ICON} alt="" />
                      </div>
                    </div>
                    <p>KAVA</p>
                  </li>

                  <li>
                    <div className="icons">
                      <div className="icon-inner">
                        <img src={MNTL_ICON} alt="" />
                      </div>
                    </div>
                    <p>MNTL</p>
                  </li>

                  <li className="group-li pool-group-width pool-group-width-2">
                    <div className="icon-group">
                      <div className="icons">
                        <div className="icon-inner">
                          <img src={COMDEX_ICON} alt="" />
                        </div>
                      </div>
                      <div className="icons">
                        <div className="icon-inner">
                          <img src={ATOM_ICON} alt="" />
                        </div>
                      </div>
                    </div>
                    <p>LP POOL 600</p>
                  </li>

                  <li className="group-li-40 pool-group-width pool-group-width-2">
                    <div className="icon-group">
                      <div className="icons">
                        <div className="icon-inner">
                          <img src={COMDEX_ICON} alt="" />
                        </div>
                      </div>
                      <div className="icons">
                        <div className="icon-inner">
                          <img src={OSMO_ICON} alt="" />
                        </div>
                      </div>
                    </div>
                    <p>LP POOL 601</p>
                  </li>
                  <li className="group-li-40 pool-group-width  pool-group-width-2">
                    <div className="icon-group">
                      <div className="icons">
                        <div className="icon-inner">
                          <img src={STATOM_ICON} alt="" />
                        </div>
                      </div>
                      <div className="icons">
                        <div className="icon-inner">
                          <img src={ATOM_ICON} alt="" />
                        </div>
                      </div>
                    </div>
                    <p>LP POOL 803</p>
                  </li>
                </ul>
                <div className="text-center mt-auto allChain-mission-btn-container">
                  <Button
                    disabled
                    type="primary"
                    onClick={() => handleClaimAll()}
                  >
                    Check Eligibility
                  </Button>
                  <Button
                    disabled
                    type="primary"
                    className="btn-filled mission-btn"
                    onClick={() =>
                      navigate(
                        `./complete-mission/${DEFAULT_CHAIN_ID_FOR_CLAIM_AIRDROP}`
                      )
                    }
                  >
                    Complete Mission
                  </Button>
                </div>
                <div className="eligibility-modal-container-check">
                  <Modal
                    centered={true}
                    className="disclaimer-modal eligibility-modal-container-check-container"
                    footer={null}
                    header={null}
                    open={isEligibilityModalOpen}
                    closable={true}
                    width={700}
                    isHidecloseButton={true}
                    onCancel={handleEligiblityModalCancel}
                    closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
                    maskStyle={{ background: "rgba(0, 0, 0, 0.6)" }}
                  >
                    <div className="eligiblity-check-modal-inner-box">
                      <h2>Enter your Comdex Wallet address </h2>

                      <Row className="mb-4">
                        <Col>
                          <div className="d-flex eligibility-check-midal-input-box">
                            <Input
                              placeholder={`Enter Your Comdex Wallet Address`}
                              className="input-box"
                              value={userComdexAddress}
                              onChange={(e) =>
                                setUserComdexAddress(e.target.value)
                              }
                            />{" "}
                            <Button
                              type="primary"
                              className="btn-filled eligibility-check-midal-input-button"
                              loading={loading}
                              disabled={loading || !userComdexAddress}
                              onClick={() => handleCheckComdexEligibility()}
                            >
                              Check
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Modal>
                </div>

                <div className="eligibility-modal-container">
                  <Modal
                    centered={true}
                    className="disclaimer-modal"
                    footer={null}
                    header={null}
                    open={isOpen}
                    closable={true}
                    width={700}
                    isHidecloseButton={true}
                    onCancel={handleCancel}
                    closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
                    maskStyle={{ background: "rgba(0, 0, 0, 0.6)" }}
                  >
                    <div className="eligiblity-inner-modal-title">
                      <h2>
                        Congrats! You are Eligible for <br />{" "}
                        <b>
                          {amountConversionWithComma(
                            userComdexEligibilityData?.claimable_amount /
                              TOTAL_ACTIVITY || 0,
                            2
                          )}{" "}
                          $HARBOR
                        </b>{" "}
                        &{" "}
                        <b>
                          {amountConversionWithComma(
                            Number(
                              userComdexEligibilityData?.claimable_amount /
                                TOTAL_ACTIVITY
                            ) * Number(TOTAL_VEHARBOR_ACTIVITY) || 0,
                            2
                          )}{" "}
                          $veHARBOR
                        </b>{" "}
                      </h2>

                      <div className="description-text">
                        <p>
                          <Lottie
                            options={defaultOptions}
                            height={100}
                            width={200}
                          />
                        </p>
                      </div>
                      <p>Share with your friends</p>
                      <div className="text-center mt-4"></div>
                      <div className="d-flex agree-btn">
                        <div className="share-btn-main-container">
                          <div className="twitter-btn-container airdrop-share-btn">
                            <a
                              href={`https://twitter.com/intent/tweet?original_referer&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&text=${shareText}`}
                              target="_blank"
                            >
                              {" "}
                              <SvgIcon name="twitter" viewbox="0 0 22 25" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="airdrop-bottom">
            <Col lg="4">
              <div className="airdrop-bottom-card airdrop-bottom-card1">
                <h2>
                  Your Airdrop Details{" "}
                  <TooltipIcon text="Total Harbor ( Magic Txn + Non Magic Txn chains + LP Pools; Harbor from Magic Txn chains will add here only after completion of magic Txn)" />
                </h2>
                <div className="airdrop-statics">
                  <p className="total-value">
                    $Harbor Airdrop{" "}
                    <TooltipIcon text="User’s Total $Harbor airdrop across all chains and pools" />
                  </p>
                  <h2>
                    {amountConversionWithComma(
                      totalEligibleToken / TOTAL_ACTIVITY || 0
                    )}{" "}
                    <sub className="text-uppercase">harbor</sub>
                  </h2>
                </div>
                <div className="airdrop-statics mb-0">
                  <p className="total-value">
                    $veHarbor Airdrop{" "}
                    <TooltipIcon text="User’s Total amount of $veharbor having a locking period of 4 months once he completes the missions" />
                  </p>
                  <h2>
                    {amountConversionWithComma(
                      Number(totalEligibleToken / TOTAL_ACTIVITY) *
                        Number(TOTAL_VEHARBOR_ACTIVITY) || 0
                    )}{" "}
                    <sub>ve</sub>
                    <sub className="text-uppercase">harbor</sub>
                  </h2>
                </div>
              </div>
            </Col>
            <Col lg="8">
              <div className="airdrop-bottom-card airdrop-bottom-card2">
                <img className="card-bg" src={MissonCardBg} alt="bg" />
                <div className="airdrop-bottom-card2-inner">
                  <div>
                    <h1>
                      Complete missions to get <br /> <span>HARBOR</span>{" "}
                      Airdrop
                    </h1>
                  </div>
                  <img src={PlanePic} alt="" />
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

Airdrop.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    isDarkMode: state.theme.theme.darkThemeEnabled,
    refreshBalance: state.account.refreshBalance,
    userEligibilityData: state.airdrop.userEligibilityData,
    userComdexEligibilityData: state.airdrop.userComdexEligibilityData,
  };
};

const actionsToProps = {
  setuserEligibilityData,
  setuserComdexEligibilityData,
};

export default connect(stateToProps, actionsToProps)(Airdrop);
