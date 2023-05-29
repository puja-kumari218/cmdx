import * as PropTypes from "prop-types";
import { SvgIcon, Row, Col } from "../../components/common";
import { connect } from "react-redux";
import { message, Spin, Input, Tooltip } from "antd";
import { useNavigate } from "react-router";
import "./index.scss";
import "./index.scss";
import { iconNameFromDenom, symbolToDenom, transformPairName } from "../../utils/string";
import TooltipIcon from "../../components/TooltipIcon";
import React, { useEffect, useState, useReducer, useRef } from "react";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DOLLAR_DECIMALS, PRODUCT_ID } from "../../constants/common";
import { setPairs } from "../../actions/asset";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  setAllExtendedPair,
  setCurrentPairID,
  setSelectedExtentedPairvault,
} from "../../actions/locker";
import { amountConversion, amountConversionWithComma } from "../../utils/coin";
import NoData from "../../components/NoData";
import { queryExtendedPairVaultById, queryPair } from "../../services/asset/query";
import { decimalConversion, formatNumber } from "../../utils/number";
import { queryVaultMintedStatistic } from "../../services/vault/query";
import { Pagination } from 'antd';
import { emissiondata, userProposalAllUpData, userProposalProjectedEmission, votingCurrentProposal, votingCurrentProposalId } from "../../services/voteContractsRead";
import { comdex } from "../../config/network";

import HotIcon from '../../assets/images/hot-icon.png';

const Minting = ({ address, refreshBalance, harborPrice, }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allVaultApr = {};
  let topFiveAprVault = useRef(null)

  const extenedPairVaultList = useSelector(
    (state) => state.locker.extenedPairVaultList[0]
  );

  const [loading, setLoading] = useState(false);
  const [vaultDebt, setVaultDebt] = useState([])
  const [pairId, setpairId] = useState({})
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(6);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE_NUMBER)
  const [totalExtendedPair, setTotalExtendedPair] = useState()
  const [allProposalData, setAllProposalData] = useState();
  const [proposalId, setProposalId] = useState();
  const [protectedEmission, setProtectedEmission] = useState(0);
  const [currentProposalAllData, setCurrentProposalAllData] = useState();
  const [proposalExtenderPair, setProposalExtenderPair] = useState();
  const [userCurrentProposalData, setUserCurrentProposalData] = useState();


  const navigateToMint = (path) => {
    navigate({
      pathname: `./vault/${path}`,
    });
  };

  useEffect(() => {
    fetchExtendexPairList(PRODUCT_ID)
  }, [address])

  useEffect(() => {
    if (extenedPairVaultList?.length > 0) {
      fetchVaultMintedTokenStatistic(PRODUCT_ID)
    }

  }, [address, extenedPairVaultList])

  const fetchExtendexPairList = (productId, offset, limit, countTotal, reverse) => {
    setLoading(true);
    queryExtendedPairVaultById(productId, offset, limit, countTotal, reverse, (error, data) => {
      setLoading(false);
      if (error) {
        message.error(error);
        return;
      }
      dispatch(setAllExtendedPair(data?.extendedPair));
      setTotalExtendedPair(data?.pagination?.total?.toNumber())
    });
  };

  const fetchVaultMintedTokenStatistic = (productId) => {
    queryVaultMintedStatistic(productId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setVaultDebt((vaultDebt) => [...vaultDebt, data?.pairStatisticData])
    });
  };

  const getIconFromPairName = (extendexPairVaultPairName) => {
    let pairName = extendexPairVaultPairName;
    pairName = pairName?.replace(/\s+/g, ' ').trim()
    if (!pairName?.includes("-")) {
      return pairName?.toLowerCase();
    } else {
      pairName = pairName?.slice(0, -2);
      pairName = pairName?.toLowerCase()
      return pairName;
    }
  }

  const calculateGlobalDebt = (value) => {
    let matchData = vaultDebt[0]?.filter((debt) => debt?.extendedPairVaultId?.toNumber() === value?.id?.toNumber())
    if (matchData?.[0] && amountConversionWithComma(matchData[0]?.mintedAmount)) {
      return amountConversionWithComma(matchData[0]?.mintedAmount, DOLLAR_DECIMALS);
    }
    return (0).toFixed(DOLLAR_DECIMALS)
  }

  useEffect(() => {
    setVaultDebt([])
    setpairId({});
  }, [])

  const handlePageChange = (currentPage, pageSize) => {
    setPageNumber(currentPage - 1);
    setPageSize(pageSize);
    setActivePage(currentPage)
    fetchExtendexPairList((currentPage - 1) * pageSize, pageSize, true, false, PRODUCT_ID);
  };

  // Emission 

  const fetchVotingCurrentProposalId = () => {
    setLoading(true)
    votingCurrentProposalId(PRODUCT_ID).then((res) => {
      setProposalId(res)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  }

  const fetchuserProposalProjectedEmission = (proposalId) => {
    userProposalProjectedEmission(proposalId).then((res) => {
      setProtectedEmission(amountConversion(res))
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchProposalAllUpData = (address, proposalId) => {
    setLoading(true)
    userProposalAllUpData(address, proposalId,).then((res) => {
      setAllProposalData(res?.proposal_pair_data)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  };

  useEffect(() => {
    fetchVotingCurrentProposalId()
  }, [])

  useEffect(() => {
    if (proposalId) {
      fetchProposalAllUpData(address, proposalId);
      fetchuserProposalProjectedEmission(proposalId)
      fetchVotingCurrentProposal(proposalId)
    }
  }, [address, proposalId, refreshBalance])

  const fetchVotingCurrentProposal = (proposalId) => {
    votingCurrentProposal(proposalId).then((res) => {
      setProposalExtenderPair(res?.extended_pair)
      setCurrentProposalAllData(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const fetchEmissiondata = (address) => {
    emissiondata(address, (error, result) => {
      if (error) {
        message.error(error);
        console.log(error, "Emission Api error");
        return;
      }
      setUserCurrentProposalData(result?.data)

    });
  }

  useEffect(() => {
    if (address) {
      fetchEmissiondata(address)
    }
  }, [address])


  const calculateTotalVotes = (id) => {
    let calculatePercentage = 0;
    let totalVote = userCurrentProposalData?.filter((item) => item?.pair_id === id);
    totalVote = totalVote?.[0]?.total_vote || 0

    calculatePercentage = (amountConversion(Number(totalVote) || 0, comdex?.coinDecimals) / amountConversion(currentProposalAllData?.total_voted_weight || 0, DOLLAR_DECIMALS)) * 100;
    calculatePercentage = Number(calculatePercentage || 0).toFixed(DOLLAR_DECIMALS)
    return calculatePercentage;
  }

  // *calculate Vault emission 
  const calculateVaultEmission = (id) => {
    // *formula = ((Total Vote of Particular Pair/total_vote_weight))*projected_emission

    let totalVoteOfPair = userCurrentProposalData?.filter((item) => item?.pair_id === id);
    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;

    let calculatedEmission = ((Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission)

    if (isNaN(calculatedEmission) || calculatedEmission === Infinity) {
      return 0;
    } else {
      return Number(calculatedEmission);
    }

  }

  const calculateAPY = (_totalVoteRatio, _totalVote, _totalMintedCMST, extendedPairID, pairName) => {
    // *formula = (365 * ((Harbor qty / 7)* harbor price)) / total cmst minted
    // !harbor qty formula=(total vote on particular vault * total week emission )/total vote
    // *harbor qty formula=(totalVoteOnIndivisualVault / TotalVoteOnAllVaults) * (TotalWeekEmission) 
    let harborTokenPrice = harborPrice;
    let totalMintedCMST = _totalMintedCMST.replace(',', '');
    let totalWeekEmission = protectedEmission;
    let harborQTY = ((Number(_totalVote) / 100) * Number(totalWeekEmission))
    let calculatedAPY = (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(totalMintedCMST);

    if (isNaN(calculatedAPY) || calculatedAPY === Infinity || calculatedAPY === 0) {
      return 0;
    } else {
      allVaultApr[extendedPairID] = (Number(calculatedAPY) * 100).toFixed(DOLLAR_DECIMALS);
      return (Number(calculatedAPY) * 100).toFixed(DOLLAR_DECIMALS);
    }
  }

  const calculatePerDollorEmissioAmount = (_id, _totalMintedCMST) => {
    let totalVoteOfPair = userCurrentProposalData?.filter((item) => item?.pair_id === _id);
    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;
    let totalMintedCMST = _totalMintedCMST.replace(',', '');
    let calculatedEmission = ((Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission)
    let calculatePerDollorValue = calculatedEmission / Number(totalMintedCMST);

    if (isNaN(calculatePerDollorValue) || calculatePerDollorValue === Infinity) {
      return "--";
    } else {
      return Number(calculatePerDollorValue).toFixed(DOLLAR_DECIMALS);
    }

  }


  useEffect(() => {
    const topVault = Object.fromEntries(
      Object.entries(allVaultApr)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    );

    topFiveAprVault.current = { ...topVault };
  }, [allVaultApr])


  if (loading) {
    return <Spin />;
  }

  return (
    <div className="app-content-wrapper vault-mint-main-container">
      {/* {extenedPairVaultList?.length > 0 ? <h1 className="choose-vault">Choose Your Vault Type</h1> : ""} */}
      {/* <Row>
        <Col className="mint-search-section">
          <Input
            placeholder="Search Asset.."
            suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
          />
        </Col>
      </Row> */}
      <div className="card-main-container mint-card-list">
        {extenedPairVaultList?.length > 0 ? (
          extenedPairVaultList?.map((item, index) => {
            if (
              item &&
              !item.isStableMintVault &&
              item.appId.toNumber() === PRODUCT_ID
            ) {
              return (
                <React.Fragment key={index}>
                  {item &&
                    (
                      <div
                        className="card-container"
                        onClick={() => {
                          dispatch(setCurrentPairID(item?.pairId?.toNumber()));
                          dispatch(setSelectedExtentedPairvault(item));
                          navigateToMint(item?.id?.toNumber());
                        }}
                      >
                        {
                          topFiveAprVault && topFiveAprVault.current?.[item?.id?.toNumber()] ?
                            <div className="hot-tag hot-tag1">
                              Hot <img src={HotIcon} alt="Hot" />
                            </div>
                            : null
                        }

                        {/* <div className="hot-tag hot-tag2">
                          Hot <img src={HotIcon} alt="Hot" />
                        </div>
                        <div className="hot-tag hot-tag3">
                          Hot <img src={HotIcon} alt="Hot" />
                        </div>
                        <div className="hot-tag hot-tag4">
                          Hot <img src={HotIcon} alt="Hot" />
                        </div> */}
                        <div className="up-container">
                          <div className="icon-container mint-page-icon-container">
                            <SvgIcon name={iconNameFromDenom(symbolToDenom(getIconFromPairName(item?.pairName)))} />
                          </div>
                          <div className="vault-name-container">
                            <div className="vault-name">{transformPairName(item?.pairName)}</div>
                          </div>
                        </div>
                        <div className="vault-desc" >
                          <Row>
                            <Col>
                              <p>Weekly Emission</p>
                              <div className={calculateVaultEmission(item?.id?.toNumber()) ? "coins" : "conis dash-line"}>
                                {
                                  calculateVaultEmission(item?.id?.toNumber()) ?
                                    <span>
                                      {
                                        userCurrentProposalData && formatNumber(calculateVaultEmission(item?.id?.toNumber()))
                                      } {" "}
                                      <span>Harbor</span>
                                    </span>
                                    : null
                                }
                              </div>
                            </Col>
                            <Tooltip
                              title={`
                              For every $1 of CMST minted, you will receive ${formatNumber(calculatePerDollorEmissioAmount(item?.id?.toNumber(), calculateGlobalDebt(item)) || 0)} amount of HARBOR HARBOR at the end of this week's emissions..
                              `}
                              overlayClassName="comdex-tooltip"
                            >
                              <Col className='text-right'>
                                <p>APY</p>
                                {/* <div className="coins dash-line"></div> */}
                                <div className={calculateAPY(
                                  userCurrentProposalData?.[item?.id?.toNumber() - 1]?.user_vote_ratio || 0,
                                  // calculateTotalVotes(amountConversion(userCurrentProposalData?.[item?.id?.toNumber() - 1]?.total_vote || 0, 6 || 0)),
                                  calculateTotalVotes(item?.id?.toNumber()),
                                  calculateGlobalDebt(item),
                                  item?.id?.toNumber(),
                                  item?.pairName
                                ) ? "coins" : "conis dash-line margin-left-auto"}>{
                                    calculateAPY(
                                      userCurrentProposalData?.[item?.id?.toNumber() - 1]?.user_vote_ratio || 0,
                                      calculateTotalVotes(item?.id?.toNumber()), calculateGlobalDebt(item),
                                      item?.id?.toNumber(),
                                      item?.pairName
                                    ) ?
                                      calculateAPY(
                                        userCurrentProposalData?.[item?.id?.toNumber() - 1]?.user_vote_ratio || 0,
                                        calculateTotalVotes(item?.id?.toNumber()), calculateGlobalDebt(item),
                                        item?.id?.toNumber(),
                                        item?.pairName
                                      ) + "%" : null
                                  }
                                </div>
                              </Col>
                            </Tooltip>
                          </Row>
                        </div>
                        <div className="bottom-container">
                          <div className="contenet-container">
                            <div className="name">
                              Min. Collateralization Ratio{" "}
                              <TooltipIcon text="Minimum collateral ratio at which Composite should be minted" />
                            </div>
                            <div className="value">
                              {(decimalConversion(item?.minCr) * 100).toFixed(2)} %
                            </div>
                          </div>
                          <div className="contenet-container">
                            <div className="name">
                              Stability Fee <TooltipIcon text="Current Interest Rate on Borrowed Amount" />
                            </div>
                            <div className="value">
                              {(decimalConversion(item?.stabilityFee) * 100).toFixed(2)} %
                            </div>
                          </div>
                          <div className="contenet-container">
                            <div className="name">
                              Min. Borrow Amount <TooltipIcon text="Minimum Composite that should be borrowed for any active vault" />
                            </div>
                            <div className="value">
                              {" "}
                              {amountConversionWithComma(item?.debtFloor, DOLLAR_DECIMALS)} CMST
                            </div>
                          </div>

                          <div className="contenet-container">
                            <div className="name">
                              Drawdown Fee <TooltipIcon text="Drawdown Fee charged is a one time value deducted per withdrawal. The value fee collected is added to the collector module" />
                            </div>
                            <div className="value">
                              {" "}
                              {(decimalConversion(item?.drawDownFee) * 100).toFixed(2)} %
                            </div>
                          </div>


                          <div className="contenet-container">
                            <div className="name">
                              Debt Ceiling <TooltipIcon text="Maximum Composite that can be withdrawn per vault type" />
                            </div>
                            <div className="value">
                              {" "}
                              {amountConversionWithComma(item?.debtCeiling, DOLLAR_DECIMALS)} CMST
                            </div>
                          </div>

                          <div className="contenet-container">
                            <div className="name">
                              Total CMST Minted <TooltipIcon text="The total $CMST Debt of the protocol against this vault type" />
                            </div>
                            <div className="value">
                              {vaultDebt.length > 0
                                ?
                                calculateGlobalDebt(item)
                                :
                                "0.00"
                              } CMST
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                </React.Fragment>
              );
            }
            else {
              return ""
            }
          })
        )
          : (
            <NoData />
          )}


      </div>
    </div >
  );
};

Minting.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  setPairs: PropTypes.func.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  harborPrice: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pairs: state.asset.pairs,
    refreshBalance: state.account.refreshBalance,
    harborPrice: state.liquidity.harborPrice,
  };
};

const actionsToProps = {
  setPairs,
};

export default connect(stateToProps, actionsToProps)(Minting);
