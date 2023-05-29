import React, { useEffect, useState } from 'react'
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import TooltipIcon from '../../../components/TooltipIcon';
import { Col, Row, SvgIcon } from '../../../components/common';
import { Table } from 'antd';
import { denomToSymbol, iconNameFromDenom } from '../../../utils/string';
import { vestingIssuedTokens, vestingLockNFTId } from '../../../services/vestingContractsRead';
import { setBalanceRefresh } from "../../../actions/account";
import { setIssuedveHARBOR } from "../../../actions/vesting";
import { amountConversion, amountConversionWithComma } from '../../../utils/coin';
import moment from 'moment';
import { DOLLAR_DECIMALS } from '../../../constants/common';
import NoDataIcon from '../../../components/common/NoDataIcon';


const Lock = ({
    address,
    refreshBalance,
    setIssuedveHARBOR,
}) => {

    const [vestingNFTId, setVestingNFTId] = useState();
    const [nftId, setNftid] = useState(0)
    const [inProcess, setInProcess] = useState(false)

    // Query 
    const fetchVestingLockNFTId = () => {
        vestingLockNFTId(address).then((res) => {
            setNftid(res?.nft)
        }).catch((error) => {
            console.log(error);
        })
    }
    const fetchVestingLockNFTData = (address) => {
        setInProcess(true)
        vestingIssuedTokens(address).then((res) => {
            setVestingNFTId(res)
            setInProcess(false)
        }).catch((error) => {
            setVestingNFTId('')
            setInProcess(false)
            console.log(error);
        })
    }

    const unixToGMTTime = (time) => {
        // *Removing miliSec from unix time 
        let newTime = Math.floor(time / 1000000000);
        var timestamp = moment.unix(newTime);
        timestamp = timestamp.format("DD-MMMM-YYYY")
        return timestamp;
    }

    const calculateTotalveHARBOR = () => {
        let totalveHARBORLocked = 0;
        let tokens = vestingNFTId && vestingNFTId?.reverse().map((item) => {
            return Number(amountConversion(item?.vtoken?.amount));
        })
        totalveHARBORLocked = tokens?.reduce((partialSum, a) => partialSum + a, 0)
        { totalveHARBORLocked && setIssuedveHARBOR(totalveHARBORLocked) }
    }

    // UseEffect calls 
    useEffect(() => {
        fetchVestingLockNFTId(address)
        calculateTotalveHARBOR()
        fetchVestingLockNFTData(address)
    }, [address, refreshBalance])

    useEffect(() => {
        calculateTotalveHARBOR()
    }, [address, vestingNFTId])


    const columns = [
        {
            title: "NFT ID",
            dataIndex: "pair",
            key: "pair",
        },
        {
            title: (
                <>
                    Staked HARBOR{" "}
                    <TooltipIcon text="Locked HARBOR" />
                </>
            ),
            dataIndex: "amount",
            key: "balance",
        },
        {
            title: <>
                Issued veHARBOR{" "}
                <TooltipIcon text="Total veHARBOR issued for the locked HARBOR" />
            </>,
            dataIndex: "value",
            key: "value",
        },
        {
            title: (
                <>
                    Locked Date <TooltipIcon text="Date of HARBOR locked" />
                </>
            ),
            dataIndex: "opening",
            key: "opening",
        },
        {
            title: (
                <>
                    Unlock Date <TooltipIcon text="Date of unlocking for locked HARBOR" />
                </>
            ),
            dataIndex: "expires",
            key: "expires",
        },
    ];

    const tableData =
        vestingNFTId && vestingNFTId?.reverse().map((item, index) => {
            return {
                key: index,
                pair: <>
                    <div className="assets-withicon">
                        <div className="assets-icon">
                            <SvgIcon
                                name={iconNameFromDenom('uharbor')}
                            />
                        </div>
                        <div className="nft-container">
                            <div className="nft-id">{nftId?.token_id || 0}</div>
                            <div className="name">NFT ID</div>
                        </div>
                    </div>
                </>,
                amount: <>
                    <div className="amount-container">
                        <div className="amount">{amountConversionWithComma(item?.token?.amount)}</div>
                        <div className="denom">{denomToSymbol(item?.token?.denom)}</div>
                    </div>
                </>,
                value: <>
                    <div className="amount-container">
                        <div className="amount">{amountConversionWithComma(item?.vtoken?.amount)}</div>
                        <div className="denom">veHARBOR</div>
                    </div>
                </>,
                opening: <>
                    <div className="amount-container opening-time-badge">
                        <div className="amount">{unixToGMTTime(item?.start_time)}</div>
                    </div>
                </>,
                expires: <>
                    <div className="amount-container">
                        <div className="amount">{unixToGMTTime(item?.end_time)}</div>
                    </div>
                </>,
            }
        })



    return (
        <>
            <div className="app-content-wrappers  more-locker-lock-table">

                <Row>
                    <Col>
                        <Table
                            className="custom-table"
                            dataSource={tableData}
                            columns={columns}
                            loading={inProcess}
                            pagination={{ defaultPageSize: 10 }}
                            scroll={{ x: "100%" }}
                            locale={{ emptyText: <NoDataIcon /> }}
                        />
                    </Col>
                </Row>
            </div>
        </>
    )
}

Lock.propTypes = {
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
    setIssuedveHARBOR,
};


export default connect(stateToProps, actionsToProps)(Lock);