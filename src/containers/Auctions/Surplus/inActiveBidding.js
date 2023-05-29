import * as PropTypes from "prop-types";
import { Table, Button } from "antd";
import { SvgIcon } from "../../../components/common";
import { iconNameFromDenom } from "../../../utils/string";
import {
    denomConversion,
    amountConversionWithComma,
} from "../../../utils/coin";
import TooltipIcon from "../../../components/TooltipIcon";
import moment from "moment";
import NoDataIcon from "../../../components/common/NoDataIcon";
import { useEffect, useState } from "react";
import { DEFAULT_PAGE_NUMBER, HALF_DEFAULT_PAGE_SIZE } from "../../../constants/common";
import { querySurplusBiddingList } from "../../../services/auction";
import { connect } from "react-redux";

export const InActiveBidding = ({ lang, address, refreshBalance }) => {

    const [biddingList, setBiddingList] = useState();
    const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
    const [pageSize, setPageSize] = useState(HALF_DEFAULT_PAGE_SIZE);
    const [inProgress, setInProgress] = useState(false);
    const [biddingsTotalCount, setBiddingsTotalCounts] = useState(0);



    const fetchBiddings = (address, offset, limit, isTotal, isReverse, history) => {
        setInProgress(true);
        querySurplusBiddingList(address, offset, limit, isTotal, isReverse, history, (error, result) => {
            setInProgress(false);

            if (error) {
                message.error(error);
                return;
            }

            if (result?.biddings?.length > 0) {
                setBiddingList(result && result.biddings);
                setBiddingsTotalCounts(result?.pagination?.total.toNumber())
            }
        });
    };

    useEffect(() => {
        fetchBiddings(address, (pageNumber - 1) * pageSize, pageSize, true, true, true);
    }, [address, refreshBalance])

    const handleChange = (value) => {
        setPageNumber(value.current);
        setPageSize(value.pageSize);
        fetchBiddings(address,
            (value.current - 1) * value.pageSize,
            value.pageSize,
            true,
            true,
            true
        );
    };
    const auctionStatusConverter = (status) => {
        if (status === "inactive") {
            return "Completed"
        } else {
            return status;
        }
    }


    const columnsBidding = [
        {
            title: (
                <>
                    Auctioned Asset{" "}
                    <TooltipIcon text="Asset used to buy the auctioned asset" />
                </>
            ),
            dataIndex: "inflowToken",
            key: "inflowToken",
            width: 200,
        },
        {
            title: (
                <>
                    Bidding Asset <TooltipIcon text="Asset to be sold in the auction" />
                </>
            ),
            dataIndex: "outflowToken",
            key: "outflowToken",
            width: 250,
        },
        {
            title: <>
                Timestamp <TooltipIcon text="Placed bid time" />
            </>,
            dataIndex: "timestamp",
            key: "timestamp",
            width: 260,
            render: (end_time) => <div className="endtime-badge">{end_time}</div>,
        },
        {
            title: (
                <>
                    Auction Status <TooltipIcon text="Auction status" />
                </>
            ),
            dataIndex: "auctionStatus",
            key: "auctionStatus",
            align: "center",
            width: 150,
        },
        {
            title: (
                <>
                    Bidding Status <TooltipIcon text="Bidding status" />
                </>
            ),
            dataIndex: "action",
            key: "action",
            align: "right",
            width: 150,
        },
    ];

    // biddingList?.reverse(); // showing newest bid first (ascending->descending)

    const tableBiddingData =
        biddingList &&
        biddingList.length > 0 &&
        biddingList.map((item, index) => {
            return {
                key: index,
                outflowToken: (
                    <>
                        <div className="assets-withicon">
                            <div className="assets-icon">
                                <SvgIcon name={iconNameFromDenom(item?.bid?.denom)} />
                            </div>
                            {amountConversionWithComma(item?.bid?.amount || 0)}{" "}
                            {denomConversion(item?.bid?.denom)}
                        </div>
                    </>
                ),
                inflowToken: (
                    <>
                        <div className="assets-withicon">
                            <div className="assets-icon">
                                <SvgIcon
                                    name={iconNameFromDenom(item?.auctionedCollateral?.denom)}
                                />
                            </div>
                            {amountConversionWithComma(
                                item?.auctionedCollateral?.amount || 0
                            )}{" "}
                            {denomConversion(item?.auctionedCollateral?.denom)}
                        </div>
                    </>
                ),
                timestamp: moment(item?.biddingTimestamp).format("MMM DD, YYYY HH:mm"),
                auctionStatus: (
                    <Button
                        size="small"
                        className={
                            item?.auctionStatus === "active"
                                ? "biddin-btn bid-btn-success"
                                : item?.auctionStatus === "inactive"
                                    ? "biddin-btn bid-btn-completed"
                                    : ""
                        }
                    >
                        {auctionStatusConverter(item?.auctionStatus)}
                    </Button>
                ),
                action: (
                    <Button
                        size="small"
                        className={
                            item?.biddingStatus === "placed"
                                ? "biddin-btn bid-btn-placed"
                                : item?.biddingStatus === "success"
                                    ? "biddin-btn bid-btn-success"
                                    : item?.biddingStatus === "rejected"
                                        ? "biddin-btn bid-btn-rejected"
                                        : ""
                        }
                    >
                        {item?.biddingStatus}
                    </Button>
                ),
            };
        });

    return (
        <Table
            className="custom-table more-table liquidation-table   bidding-bottom-table"
            dataSource={tableBiddingData}
            columns={columnsBidding}
            loading={inProgress}
            onChange={(event) => handleChange(event)}
            scroll={{ x: "100%" }}
            pagination={{
                total:
                    biddingsTotalCount &&
                    biddingsTotalCount,
                pageSize,
            }}
            locale={{ emptyText: <NoDataIcon /> }}
        />
    );
};

InActiveBidding.prototype = {
    lang: PropTypes.string.isRequired,
    refreshBalance: PropTypes.number.isRequired,

}

const stateToProps = (state) => {
    return {
        lang: state.language,
        refreshBalance: state.account.refreshBalance,
    };
};

const actionsToProps = {
};

export default connect(stateToProps, actionsToProps)(InActiveBidding);

