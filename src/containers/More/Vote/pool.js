import React, { useEffect, useState } from 'react'
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import './index.scss';
import { connect } from "react-redux";
import { Button, message, Table, Tabs } from "antd";
import { denomToSymbol, iconNameFromDenom, symbolToDenom } from "../../../utils/string";
import { amountConversion, amountConversionWithComma } from '../../../utils/coin';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DOLLAR_DECIMALS, PRODUCT_ID } from '../../../constants/common';
import { totalVTokens, userProposalAllUpData, userProposalAllUpPoolData, votingCurrentProposal, votingCurrentProposalId, votingTotalBribs, votingTotalVotes, votingUserVote } from '../../../services/voteContractsRead';
import { queryAssets, queryPair, queryPairVault } from '../../../services/asset/query';
import { queryMintedTokenSpecificVaultType, queryOwnerVaults, queryOwnerVaultsInfo, queryUserVaults } from '../../../services/vault/query';
import { transactionForVotePairProposal } from '../../../services/voteContractsWrites';
import { setBalanceRefresh } from "../../../actions/account";
import { Link } from 'react-router-dom';
import moment from 'moment';
import TooltipIcon from '../../../components/TooltipIcon';
import Snack from '../../../components/common/Snack';
import variables from '../../../utils/variables';
import { comdex } from '../../../config/network';
import NoDataIcon from '../../../components/common/NoDataIcon';
import CustomSkelton from '../../../components/CustomSkelton';
import { queryDeserializePoolCoin, queryFarmedPoolCoin, queryFarmer, queryPoolsList } from '../../../services/pools/query';
import { formatNumber } from '../../../utils/number';
import { fetchRestPrices } from '../../../services/oracle/query';
import ViewAllToolTip from './viewAllModal';

const Pool = ({
    lang,
    address,
    refreshBalance,
    setBalanceRefresh,
    cswapPrice,
    assetMap,
}) => {
    const [loading, setLoading] = useState(false);
    const [inProcess, setInProcess] = useState(false);
    const [proposalId, setProposalId] = useState();
    const [proposalExtenderPair, setProposalExtenderPair] = useState();
    const [currentProposalAllData, setCurrentProposalAllData] = useState();
    const [disableVoteBtn, setVoteDisableBtn] = useState(true)
    const [allProposalData, setAllProposalData] = useState();
    const [allProposalPoolData, setAllProposalPoolData] = useState();
    const [btnLoading, setBtnLoading] = useState(0);
    const [pairVaultData, setPairValutData] = useState({})
    const [assetList, setAssetList] = useState();
    const [pairIdData, setPairIdData] = useState({});
    const [totalBorrowed, setTotalBorrowed] = useState({});
    const [vaultId, setVaultId] = useState({});
    const [myBorrowed, setMyBorrowed] = useState({});
    const [userPoolFarmedData, setUserPoolFarmedData] = useState({})
    const [totalPoolFarmedData, setTotalPoolFarmedData] = useState({})
    const [deserializePoolCoin, setDeserializePoolCoin] = useState({})

    const [poolList, setPoolList] = useState();

    const [totalVotingPower, setTotalVotingPower] = useState(0);

    // Query 
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

    const fetchVotingCurrentProposal = (proposalId) => {
        votingCurrentProposal(proposalId).then((res) => {
            setProposalExtenderPair(res?.extended_pair)
            setCurrentProposalAllData(res)
        }).catch((error) => {
            console.log(error);
        })
    }

    const getProposalTimeExpiredOrNot = () => {
        let endTime = currentProposalAllData?.voting_end_time;
        // *Removing miliSec from unix time 
        let newEndTime = Math.floor(endTime / 1000000000);
        let currentTime = moment().unix();
        if (currentTime > newEndTime) {
            return setVoteDisableBtn(true)
        }
        else {
            return setVoteDisableBtn(false)
        }
    }

    const fetchAssets = (offset, limit, countTotal, reverse) => {
        queryAssets(offset, limit, countTotal, reverse, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setAssetList(data.assets)
        });
    };

    const fetchQueryPairValut = (extendedPairId) => {
        queryPairVault(extendedPairId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setPairIdData((prevState) => ({
                ...prevState, [extendedPairId]: data?.pairVault?.pairId?.toNumber()
            }))
            setPairValutData((prevState) => ({
                ...prevState, [extendedPairId]: data?.pairVault?.pairName
            }))
        })
    }

    const fetchtotalBorrowed = (productId, extendedPairId) => {
        queryMintedTokenSpecificVaultType(productId, extendedPairId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setTotalBorrowed((prevState) => ({
                ...prevState, [extendedPairId]: data?.tokenMinted
            }))
        })
    }

    const getOwnerVaultId = (productId, address, extentedPairId) => {
        queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setVaultId((prevState) => ({
                ...prevState, [extentedPairId]: data?.vaultId?.toNumber()
            }))
        })
    }

    const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
        queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setMyBorrowed((prevData) => ({
                ...prevData, [data?.vault?.extendedPairVaultId?.toNumber()]: data?.vault?.amountOut
            }))
        })
    }

    const fetchTotalVTokens = (address, height) => {
        totalVTokens(address, height).then((res) => {
            setTotalVotingPower(res)
        }).catch((error) => {
            console.log(error);
        })
    }

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

    const calculateTotalVotes = (value) => {
        let userTotalVotes = 0;
        let calculatePercentage = 0;
        calculatePercentage = (Number(value) / amountConversion(currentProposalAllData?.total_voted_weight || 0, DOLLAR_DECIMALS)) * 100;
        calculatePercentage = Number(calculatePercentage || 0).toFixed(DOLLAR_DECIMALS)
        return calculatePercentage;
    }

    useEffect(() => {
        fetchVotingCurrentProposalId()
        if (proposalId) {
            fetchVotingCurrentProposal(proposalId)
        } else {
            setProposalExtenderPair("")
        }
    }, [address, proposalId, refreshBalance])

    const getPairFromExtendedPair = () => {
        allProposalData && allProposalData.map((item) => {
            fetchQueryPairValut(item?.extended_pair_id)
            getOwnerVaultId(PRODUCT_ID, address, item?.extended_pair_id)
            fetchtotalBorrowed(PRODUCT_ID, item?.extended_pair_id)
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

    const fetchProposalAllUpPoolData = (address, proposalId) => {
        setLoading(true)
        userProposalAllUpPoolData(address, proposalId,).then((res) => {
            setAllProposalPoolData(res?.proposal_pair_data)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            console.log(error);
        })
    };

    const fetchPoolLists = () => {
        queryPoolsList((error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setPoolList(data?.pools)
        })
    }


    const fetchFarmer = (poolId, address, extendexPairId) => {
        queryFarmer(poolId, address, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setUserPoolFarmedData((prevData) => ({
                ...prevData, [extendexPairId]: data
                // ...prevData, [extendexPairId]: data?.activePoolCoin?.amount
            }))
        })
    }

    const fetchFarmedPoolCoin = (poolId, extendexPairId) => {
        queryFarmedPoolCoin(poolId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setTotalPoolFarmedData((prevData) => ({
                ...prevData, [extendexPairId]: data
                // ...prevData, [extendexPairId]: data?.coin?.amount
            }))
        })
    }

    useEffect(() => {
        proposalExtenderPair && proposalExtenderPair.map((item) => {
            getOwnerVaultInfoByVaultId(vaultId[item])
        })
    }, [vaultId, refreshBalance])

    useEffect(() => {
        if (proposalId) {
            fetchProposalAllUpData(address, proposalId);
            fetchProposalAllUpPoolData(address, proposalId);

        }
    }, [address, proposalId, refreshBalance])


    const handleVote = (item, index) => {
        setInProcess(true)
        setBtnLoading(index)
        if (address) {
            if (proposalId) {
                if (amountConversion(totalVotingPower, DOLLAR_DECIMALS) === Number(0).toFixed(DOLLAR_DECIMALS)) {
                    message.error("Insufficient Voting Power")
                    setInProcess(false)
                }
                else {
                    transactionForVotePairProposal(address, PRODUCT_ID, proposalId, item, (error, result) => {
                        if (error) {
                            message.error(error?.rawLog || "Transaction Failed")
                            setInProcess(false)
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
                        setInProcess(false)
                    })

                }
            } else {
                setInProcess(false)
                message.error("Please enter amount")
            }
        }
        else {
            setInProcess(false)
            message.error("Please Connect Wallet")
        }
    }

    const getPoolId = (value) => {
        let extendedPairId = value;
        let divisor = 10 ** comdex?.coinDecimals
        let result = extendedPairId % divisor;
        return result;
    }

    const getUserFarmData = (address) => {
        allProposalPoolData?.map((item) => {
            fetchFarmer(getPoolId(item?.extended_pair_id), address, item?.extended_pair_id)
            fetchFarmedPoolCoin(getPoolId(item?.extended_pair_id), item?.extended_pair_id)
        })
    }

    useEffect(() => {
        getUserFarmData(address)
    }, [allProposalPoolData, address])

    useEffect(() => {
        if (currentProposalAllData) {
            fetchTotalVTokens(address, currentProposalAllData?.height)
            getProposalTimeExpiredOrNot()
        }
    }, [address, refreshBalance, currentProposalAllData])

    useEffect(() => {
        fetchAssets(
            (DEFAULT_PAGE_NUMBER - 1) * (DEFAULT_PAGE_SIZE * 2),
            (DEFAULT_PAGE_SIZE * 2),
            true,
            false
        );
    }, [])

    useEffect(() => {
        fetchPoolLists()
    }, [])

    useEffect(() => {
        getPairFromExtendedPair()
    }, [allProposalData, refreshBalance])

    const calculateToatalUserFarmedToken = (tokens) => {
        let activePoolCoins = Number(tokens?.activePoolCoin?.amount) || 0;
        let quedPoolCoins = 0;
        let totalUserPoolCoin = 0;
        let quedPoolCoinsArray = tokens?.queuedPoolCoin?.map((item) => {
            let amount = Number(item?.poolCoin?.amount)
            quedPoolCoins += amount;
        })
        totalUserPoolCoin = activePoolCoins + quedPoolCoins
        return totalUserPoolCoin;
    }

    useEffect(() => {
        if (userPoolFarmedData) {
            Object.keys(userPoolFarmedData).forEach(function (singleUserPoolData, index) {
                let calculatedPoolAmount = calculateToatalUserFarmedToken(userPoolFarmedData[singleUserPoolData])
                queryDeserializePoolCoin(Number(singleUserPoolData) % 1000000, calculatedPoolAmount, (error, result) => {
                    if (error) {
                        message.error(error);
                        return;
                    }
                    setDeserializePoolCoin((prevData) => ({
                        ...prevData, [singleUserPoolData]: result
                    }))
                })
            });
        }
    }, [userPoolFarmedData])


    const calculateFarmedTokenInDollorTerm = (singleCoins) => {
        let coinA = singleCoins?.coins[0];
        let coinB = singleCoins?.coins[1];
        let coinATokens = () => {
            let amount = amountConversion(coinA?.amount, comdex.coinDecimals, assetMap[coinA?.denom]?.decimals);
            let denom = denomToSymbol(coinA?.denom);
            let price = cswapPrice?.filter((item) => item.symbol == denom)
            let tokenPrice = Number(amount) * (price[0]?.price || 0)
            return tokenPrice;
        };
        let coinBTokens = () => {
            let amount = amountConversion(coinB?.amount, comdex.coinDecimals, assetMap[coinB?.denom]?.decimals);
            let denom = denomToSymbol(coinB?.denom);
            let price = cswapPrice?.filter((item) => item.symbol == denom)
            let tokenPrice = Number(amount) * (price[0]?.price || 0)
            return tokenPrice;
        };
        let tokenADollorvalue = coinATokens();
        let tokenBDollorvalue = coinBTokens();
        let totalDollorValue = Math.floor((Number(tokenADollorvalue) + Number(tokenBDollorvalue)) * Math.pow(10, DOLLAR_DECIMALS)) / Math.pow(10, DOLLAR_DECIMALS);
        return totalDollorValue;
    }

    const poolColumns = [
        {
            title: (
                <>
                    Pool
                </>
            ),
            dataIndex: "asset",
            key: "asset",
            width: 230,
        },
        {
            title: (
                <>
                    My Farmed {" "}
                </>
            ),
            dataIndex: "my_borrowed",
            key: "my_borrowed",
            width: 150,
        },
        // {
        //     title: (
        //         <>
        //             Total Farmed
        //         </>
        //     ),
        //     dataIndex: "total_borrowed",
        //     key: "total_borrowed",
        //     width: 200,
        // },
        {
            title: (
                <>
                    Total Votes
                </>
            ),
            dataIndex: "total_votes",
            key: "total_votes",
            width: 200,
        },

        {
            title: (
                <>
                    External Incentives
                </>
            ),
            dataIndex: "bribe",
            key: "bribe",
            width: 250,
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
                                <span>{amountConversionWithComma(item[0]?.amount, DOLLAR_DECIMALS)} {denomToSymbol(item[0]?.denom)} </span>

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
                        : <div className="mt-1" >0</div>

                    }

                </>
            ),
        },
        {
            title: (
                <>
                    My Vote
                </>
            ),
            dataIndex: "my_vote",
            key: "my_vote",
            align: "center",
            width: 200,
        },
        {
            title: (
                <>
                    Action
                </>
            ),
            dataIndex: "action",
            key: "action",
            align: "centre",
            width: 130,
        },
    ];

    const poolTableData =
        allProposalPoolData && allProposalPoolData.map((item, index) => {
            return {
                key: index,
                asset: (
                    <>
                        <div className="assets-withicon">
                            <div className="assets-icon">
                                <SvgIcon
                                    name={iconNameFromDenom(poolList && poolList[index]?.balances?.baseCoin?.denom)}
                                />
                            </div>
                            <div className="assets-icon" style={{ marginLeft: "-22px" }}>
                                <SvgIcon
                                    name={iconNameFromDenom(poolList && poolList[index]?.balances?.quoteCoin?.denom)}
                                />
                            </div>
                            {denomToSymbol(poolList && poolList[index]?.balances?.baseCoin?.denom)} - {denomToSymbol(poolList && poolList[index]?.balances?.quoteCoin?.denom)}
                        </div>
                    </>
                ),
                my_borrowed: (
                    <>
                        <div className="assets-withicon display-center">
                            ${deserializePoolCoin[item?.extended_pair_id] ? formatNumber(calculateFarmedTokenInDollorTerm(deserializePoolCoin[item?.extended_pair_id])) : Number(0).toFixed(2)}
                        </div>
                    </>
                ),
                total_borrowed:
                    <div>
                        {totalPoolFarmedData[item?.extended_pair_id] ? formatNumber(totalPoolFarmedData[item?.extended_pair_id]) : Number(0).toFixed(2)}
                    </div>,
                // total_votes: <div >{item?.total_vote ? amountConversionWithComma(item?.total_vote, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR <div style={{ fontSize: "12px" }}>{item?.total_vote ? calculateTotalVotes(amountConversion(item?.total_vote || 0, 6) || 0) : Number(0).toFixed(DOLLAR_DECIMALS)}%</div></div>,
                total_votes: <div >{item?.total_vote ? amountConversionWithComma(item?.total_vote, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR</div>,
                bribe: item?.bribe,
                my_vote: <div>{item?.my_vote ? amountConversion(item?.my_vote, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR</div>,
                action: <>
                    <Button
                        type="primary"
                        className="btn-filled"
                        size="sm"
                        loading={index === btnLoading ? inProcess : false}
                        onClick={() => handleVote(item?.extended_pair_id, index)}
                        disabled={disableVoteBtn}
                    >
                        Vote
                    </Button>
                </>,
            }
        })

    return (
        <>
            <div className="app-content-wrapper">
                <Row>
                    <Col>
                        <div className="composite-card ">
                            <div className="card-content">
                                <Table
                                    className="custom-table liquidation-table"
                                    dataSource={poolTableData}
                                    columns={poolColumns}
                                    loading={loading}
                                    pagination={false}
                                    scroll={{ x: "100%" }}
                                    locale={{ emptyText: <NoDataIcon /> }}
                                />
                            </div>
                        </div>

                    </Col>
                </Row>
            </div>

        </>
    )
}

Pool.propTypes = {
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
export default connect(stateToProps, actionsToProps)(Pool);