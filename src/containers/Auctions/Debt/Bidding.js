import * as PropTypes from "prop-types";
import { Table, Button, message } from "antd";
import { SvgIcon } from "../../../components/common";
import { iconNameFromDenom } from "../../../utils/string";
import { denomConversion, amountConversionWithComma } from "../../../utils/coin";
import TooltipIcon from "../../../components/TooltipIcon";
import moment from "moment";
import { queryDebtBiddingList } from "../../../services/auction";
import { useEffect, useState } from "react";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, HALF_DEFAULT_PAGE_SIZE, } from "../../../constants/common";
import { connect } from "react-redux";
import NoDataIcon from "../../../components/common/NoDataIcon";

export const Bidding = ({ lang, address, refreshBalance }) => {

  const [biddingList, setBiddingList] = useState();
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(HALF_DEFAULT_PAGE_SIZE);
  const [inProgress, setInProgress] = useState(false);
  const [biddingsTotalCount, setBiddingsTotalCounts] = useState(0);



  const fetchBiddings = (address, offset, limit, isTotal, isReverse, history) => {
    setInProgress(true);
    queryDebtBiddingList(address, offset, limit, isTotal, isReverse, history, (error, result) => {
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
    fetchBiddings(address, (pageNumber - 1) * pageSize, pageSize, true, true, false);
  }, [address, refreshBalance])



  const columnsBidding = [
    {
      title: (
        <>
          Auctioned Asset <TooltipIcon text="Asset used to buy the auctioned asset" />
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
      title: (
        <>
          Timestamp <TooltipIcon text="Placed bid time" />
        </>
      ),
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


  const tableBiddingData =
    biddingList &&
    biddingList.length > 0 &&
    biddingList.map((item, index) => {
      return {
        key: index,
        inflowToken: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(item?.bid?.denom)}
                />
              </div>
              {amountConversionWithComma(item?.bid?.amount || 0)}{" "}
              {denomConversion(item?.bid?.denom)}
            </div>
          </>
        ),
        outflowToken: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(item?.outflowTokens?.denom)}
                />
              </div>
              {amountConversionWithComma(item?.outflowTokens?.amount || 0)}{" "}
              {denomConversion(item?.outflowTokens?.denom)}
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
                  ? "biddin-btn bid-btn-rejected"
                  : ""
            }
          >
            {item?.auctionStatus}
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

  const handleChange = (value) => {
    setPageNumber(value.current);
    setPageSize(value.pageSize);
    fetchBiddings(address,
      (value.current - 1) * value.pageSize,
      value.pageSize,
      true,
      true,
      false
    );
  };

  return (
    <Table
      className="custom-table more-table liquidation-table   bidding-bottom-table"
      dataSource={tableBiddingData}
      loading={inProgress}
      columns={columnsBidding}
      onChange={(event) => handleChange(event)}
      pagination={{
        total:
          biddingsTotalCount &&
          biddingsTotalCount,
        pageSize,
      }}
      scroll={{ x: "100%" }}
      locale={{ emptyText: <NoDataIcon /> }}
    />
  );
};

Bidding.prototype = {
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

export default connect(stateToProps, actionsToProps)(Bidding);
