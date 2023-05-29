import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { Button, Tabs } from "antd";
import { useDispatch } from "react-redux";
import {
    setPair, setAssetIn,
    setAssetOut, setAmountOut,
} from "../../actions/asset";
import { setAmountIn } from '../../actions/asset'
import { setLockerDefaultSelectTab } from "../../actions/locker";
import { useSelector } from "react-redux";
import { toDecimals } from "../../utils/string";
import { calculateROI, decimalConversion } from "../../utils/number";
import { DOLLAR_DECIMALS } from "../../constants/common";
import Deposit from "./Deposit/index";
import Withdraw from "./Withdraw/index";
import PricePool from "./vaultDetail/details";
import './index.scss'
import { Link } from "react-router-dom";

const StableMintVault = ({
    lang,
    address,
    setAmountIn,
    lockerDefaultSelectTab,
    setLockerDefaultSelectTab
}) => {
    const dispatch = useDispatch();

    const tabItems =
        [
            { label: "Deposit", key: "1", children: <Deposit /> },
            { label: "Withdraw", key: "2", children: <Withdraw /> },
        ]

    const callback = (key) => {
        dispatch(setAmountIn(0));
        setLockerDefaultSelectTab(key)
    };


    useEffect(() => {
        setLockerDefaultSelectTab("1")
    }, [])

    return (
        <>
            <div className="app-content-wrapper details-wrapper">
                <Row className="earn-main-container stableMint-main-container stableMint-tab-main-container">
                    <Col>
                        <Tabs
                            type="card"
                            activeKey={lockerDefaultSelectTab}
                            onChange={callback}
                            className="comdex-tabs farm-modal-tab"
                            items={tabItems}
                        />
                    </Col>

                    <Col>
                        <div className="details-right Stable-details-right mint-detail-stats-container">
                            <PricePool />
                        </div>
                    </Col>

                    <Row>
                        <div className="stableMint-back-button-container">

                            <Link to="/stableMint">
                                <Button className="back-btn" type="primary">
                                    Back
                                </Button>
                            </Link>
                        </div>

                    </Row>
                </Row>

            </div>
        </>
    );
};
StableMintVault.propTypes = {
    lang: PropTypes.string.isRequired,
    collectorData: PropTypes.array.isRequired,
    lockerDefaultSelectTab: PropTypes.string,
    setAmountIn: PropTypes.func.isRequired,
    setAmountOut: PropTypes.func.isRequired,
    setAssetIn: PropTypes.func.isRequired,
    setAssetOut: PropTypes.func.isRequired,
    address: PropTypes.string,
    setPair: PropTypes.func.isRequired,
    balances: PropTypes.arrayOf(
        PropTypes.shape({
            denom: PropTypes.string.isRequired,
            amount: PropTypes.string,
        })
    ),
    markets: PropTypes.arrayOf(
        PropTypes.shape({
            rates: PropTypes.shape({
                high: PropTypes.number,
                low: PropTypes.number,
                unsigned: PropTypes.bool,
            }),
            symbol: PropTypes.string,
            script_id: PropTypes.string,
        })
    ),
    pair: PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
    }),
    pairs: PropTypes.shape({
        list: PropTypes.arrayOf(
            PropTypes.shape({
                denomIn: PropTypes.string,
                denomOut: PropTypes.string,
                liquidationRatio: PropTypes.string,
                id: PropTypes.shape({
                    high: PropTypes.number,
                    low: PropTypes.number,
                    unsigned: PropTypes.bool,
                }),
            })
        ),
    }),
    refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
    return {
        lang: state.language,
        collectorData: state.locker.collectorData,
        lockerDefaultSelectTab: state.locker.lockerDefaultSelectTab,
        address: state.account.address,
        inAmount: state.asset.inAmount,
        outAmount: state.asset.outAmount,
        pair: state.asset.pair,
        pairs: state.asset.pairs,
        markets: state.oracle.market.list,
        balances: state.account.balances.list,
        refreshBalance: state.account.refreshBalance,
    };
};
const actionsToProps = {
    setLockerDefaultSelectTab,
    setPair,
    setAssetIn,
    setAssetOut,
    setAmountIn,
    setAmountOut,
};
export default connect(stateToProps, actionsToProps)(StableMintVault);