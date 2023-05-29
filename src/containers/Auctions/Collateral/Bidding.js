import { Table, Button } from "antd";
import { SvgIcon } from "../../../components/common";
import { iconNameFromDenom } from "../../../utils/string";
import { denomConversion, amountConversionWithComma } from "../../../utils/coin";
import TooltipIcon from "../../../components/TooltipIcon";
import moment from "moment";
import { comdex } from "../../../config/network";
import { queryDutchBiddingList } from "../../../services/auction";
import { useEffect, useState } from "react";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, HALF_DEFAULT_PAGE_SIZE } from "../../../constants/common";
import NoDataIcon from "../../../components/common/NoDataIcon";

export const Bidding = ({ address, refreshBalance, assetMap }) => {

  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(HALF_DEFAULT_PAGE_SIZE);
  const [inProgress, setInProgress] = useState(false);
  const [biddingList, setBiddingList] = useState("");
  const [biddingsTotalCount, setBiddingsTotalCounts] = useState(0);



  const fetchBiddings = (address, offset, limit, countTotal, reverse, history) => {
    setInProgress(true);
    queryDutchBiddingList(address, offset, limit, countTotal, reverse, history, (error, result) => {
      setInProgress(false);

      if (error) {
        message.error(error);
        return;
      }
      if (result?.biddings?.length > 0) {
        let reverseData = result && result.biddings;
        setBiddingList(reverseData);
        setBiddingsTotalCounts(result?.pagination?.total?.toNumber());
      } else {
        setBiddingList("");
      }
    });
  };


  useEffect(() => {
    if (address) {
      fetchBiddings(address, (pageNumber - 1) * pageSize, pageSize, true, true, false);
    }
  }, [address, refreshBalance])

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

  const columnsBidding = [
    {
      title: (
        <>
          Auctioned Asset <TooltipIcon text="Asset to be sold in the auction" />
        </>
      ),
      dataIndex: "inflowToken",
      key: "inflowToken",
      width: 200,
    },
    {
      title: (
        <>
          Bidding Asset{" "}
          <TooltipIcon text="Asset used to buy the auctioned asset" />
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
      width: 250,
      render: (end_time) => <div className="endtime-badge">{end_time}</div>,
    },
    {
      title: (
        <>
          Auction Status <TooltipIcon text="Status of auction" />
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
          Bidding Status <TooltipIcon text="Bidding status of auction" />
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
        outflowToken: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(item?.outflowTokenAmount?.denom)}
                />
              </div>
              {amountConversionWithComma(item?.outflowTokenAmount?.amount || 0, comdex?.coinDecimals, assetMap[item?.outflowTokenCurrentAmount?.denom]?.decimals)}{" "}
              {denomConversion(item?.outflowTokenAmount?.denom)}
            </div>
          </>
        ),
        inflowToken: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(item?.inflowTokenAmount?.denom)}
                />
              </div>
              {amountConversionWithComma(item?.inflowTokenAmount?.amount || 0, comdex?.coinDecimals, assetMap[item?.inflowTokenAmount?.denom]?.decimals)}{" "}
              {denomConversion(item?.inflowTokenAmount?.denom)}
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

  return (
    <Table
      className="custom-table more-table liquidation-table bidding-bottom-table"
      dataSource={tableBiddingData}
      columns={columnsBidding}
      onChange={(event) => handleChange(event)}
      pagination={{
        total:
          biddingsTotalCount &&
          biddingsTotalCount,
        pageSize,
      }}
      loading={inProgress}
      scroll={{ x: "100%" }}
      locale={{ emptyText: <NoDataIcon /> }}
    />
  );
};

export default Bidding;
