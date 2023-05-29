import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, message, Tabs } from 'antd';
import React, { useEffect, useState } from 'react'
import { Col, Row, SvgIcon } from '../../../components/common';
import './index.scss'
import Lock from "./lock";
import Create from "./create";
import { setBalanceRefresh } from "../../../actions/account";
import { setLockActiveTab } from "../../../actions/vesting";
import { vestingIssuedTokens, withdrawableHarbor } from "../../../services/vestingContractsRead";
import { denomToSymbol, iconNameFromDenom } from "../../../utils/string";
import { amountConversionWithComma } from "../../../utils/coin";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { transactionForClaimLockedHarbor } from "../../../services/vestingContractsWrite";
import TooltipIcon from "../../../components/TooltipIcon";
import { commaSeparator } from "../../../utils/number";
import { Link } from "react-router-dom";
import Snack from "../../../components/common/Snack";
import variables from "../../../utils/variables";
import { comdex } from "../../../config/network";

const { TabPane } = Tabs;

const Vesting = ({
    lang,
    address,
    refreshBalance,
    setBalanceRefresh,
    issuedveHARBOR,
    lockActiveKey,
    setLockActiveTab
}) => {
    const [issuedToken, setIssuedTokens] = useState();
    const [withdrawableToken, setWithdrawableToken] = useState();
    const [loading, setLoading] = useState(false)
    const [activeKey, setActiveKey] = useState("1")

    const tabItems =
        [
            { label: "Create", key: "1", children: <Create /> },
            { label: "Staked HARBOR", key: "2", disabled: !issuedToken?.length > 0, children: <Lock /> },
        ]

    const callback = (key) => {
        setActiveKey(key)
    };

    // Query 
    const fetchVestingLockNFTId = (address) => {
        vestingIssuedTokens(address).then((res) => {
            setIssuedTokens(res)
        }).catch((error) => {

            console.log(error);
        })
    }
    const fetchWithdrawableHarbor = (address) => {
        withdrawableHarbor(address).then((res) => {
            setWithdrawableToken(res?.amount)
        }).catch((error) => {
            console.log(error);
        })
    }
    const handleClaimLockedharbor = () => {
        setLoading(true)
        if (address) {
            transactionForClaimLockedHarbor(address, (error, result) => {
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

    useEffect(() => {
        if (address) {
            fetchVestingLockNFTId(address)
            fetchWithdrawableHarbor(address)
        }
    }, [address, refreshBalance])

    useEffect(() => {
        if (lockActiveKey) {
            setActiveKey("2")
        }
        setTimeout(() => {
            setLockActiveTab(false)
        }, 1000);
    }, [])


    const BackButton = {
        right: (
            <>
                <div className="more-locker-tab-back-btn">
                    <Link to="/more"><Button className="back-btn" type="primary">Back</Button></Link>
                </div>
            </>
        ),
    };

    const claimButton = {
        right: (
            <>
                <Row >
                    <Row>
                        <Col>
                            <div className="totol-voting-main-container mr-3">
                                <div className="total-voting-container">
                                    <div className="total-veHARBOR">
                                        My veHARBOR : <span className='fill-box'><span>{commaSeparator(Number(issuedveHARBOR).toFixed(6) || 0)}</span> veHARBOR </span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div className="locker-up-main-container">
                        <div className="locker-up-container">
                            <div className="claim-container ">
                                <div className="claim-btn">
                                    <Button
                                        type="primary"
                                        className="btn-filled mr-1"
                                        loading={loading}
                                        disabled={
                                            !Number(withdrawableToken?.amount)
                                            || loading
                                        }
                                        onClick={() => handleClaimLockedharbor()}
                                    >Claim</Button>
                                </div>
                                <div className="claim-value">
                                    <div className="icon">
                                        <div className="assets-icon">
                                            <SvgIcon
                                                name={iconNameFromDenom(withdrawableToken?.denom)}
                                            />
                                        </div>
                                    </div>
                                    <div className="value">{withdrawableToken?.amount ? amountConversionWithComma(withdrawableToken?.amount, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)}</div>
                                </div> {"   "} <span className="ml-2"> <TooltipIcon text="Total unlocked HARBOR to claim" /></span>
                            </div>
                        </div>
                    </div>

                </Row>
            </>
        ),
    };

    return (
        <>
            <div className="app-content-wrapper">
                <Row>
                    <Col>
                        <Tabs
                            className="comdex-tabs more-locker-tab"
                            activeKey={activeKey}
                            onChange={callback}
                            tabBarExtraContent={activeKey === "2" ? claimButton : BackButton}
                            items={tabItems}
                        />
                    </Col>
                </Row>
            </div>
        </>
    )
}
Vesting.propTypes = {
    lang: PropTypes.string.isRequired,
    address: PropTypes.string,
    refreshBalance: PropTypes.number.isRequired,
    issuedveHARBOR: PropTypes.number.isRequired,
    lockActiveKey: PropTypes.number.isRequired,
};
const stateToProps = (state) => {
    return {
        lang: state.language,
        address: state.account.address,
        refreshBalance: state.account.refreshBalance,
        issuedveHARBOR: state.vesting.issuedveHARBOR,
        lockActiveKey: state.vesting.lockActiveKey,
    };
};

const actionsToProps = {
    setBalanceRefresh,
    setLockActiveTab,
};
export default connect(stateToProps, actionsToProps)(Vesting);