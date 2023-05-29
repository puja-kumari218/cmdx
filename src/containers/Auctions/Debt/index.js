import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import { connect } from "react-redux";
import { Table, Tabs } from "antd";
import PlaceBidModal from "./PlaceBidModal";
import "../index.scss";
import FilterModal from "../FilterModal/FilterModal";
import { setPairs } from "../../../actions/asset";
import Bidding from "./Bidding";
import {
  queryDebtAuctionList,
  queryDebtBiddingList,
  queryAuctionParams,
} from "../../../services/auction";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../../../constants/common";
import { message } from "antd";
import { useState, useEffect } from "react";
import { iconNameFromDenom } from "../../../utils/string";
import {
  amountConversionWithComma,
  denomConversion,
} from "../../../utils/coin";
import moment from "moment";
import TooltipIcon from "../../../components/TooltipIcon";
import NoDataIcon from "../../../components/common/NoDataIcon";
import { InActiveBidding } from "./inactiveBidding";

const DebtAuctions = ({ setPairs, address, refreshBalance, }) => {
  const { TabPane } = Tabs;

  const tabItems =
    [
      { label: "Active", key: "1", children: <Bidding address={address} /> },
      { label: "Completed", key: "2", children: <InActiveBidding address={address} /> }
    ]

  const [activeKey, setActiveKey] = useState("1");
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [inProgress, setInProgress] = useState(false);
  const [params, setParams] = useState({});
  const [auctions, setAuctions] = useState();
  const [biddings, setBiddings] = useState();

  const callback = (key) => {
    setActiveKey(key);
  };

  useEffect(() => {
    queryParams();
    fetchAuctions((pageNumber - 1) * pageSize, pageSize, true, false);
  }, [address, refreshBalance]);


  const queryParams = () => {
    queryAuctionParams((error, result) => {
      if (error) {
        return;
      }

      setParams(result?.auctionParams);
    });
  };

  const handleChange = (value) => {
    setPageNumber(value.current - 1);
    setPageSize(value.pageSize);
    fetchAuctions(
      (value.current - 1) * value.pageSize,
      value.pageSize,
      true,
      false
    );
  };

  const fetchAuctions = (offset, limit, isTotal, isReverse) => {
    setInProgress(true);
    queryDebtAuctionList(offset, limit, isTotal, isReverse, (error, result) => {
      setInProgress(false);

      if (error) {
        message.error(error);
        return;
      }
      if (result?.auctions?.length > 0) {
        // setAuctions(result && result.auctions);
        setAuctions(result && result);
      }
    });
  };

  const columns = [
    {
      title: (
        <>
          Auctioned Asset <TooltipIcon text="Asset to be sold in the auction" />
        </>
      ),
      dataIndex: "auctioned_asset",
      key: "auctioned_asset",
      width: 150,
    },
    {
      title: (
        <>
          Bidding Asset{" "}
          <TooltipIcon text="Asset used to buy the auctioned asset" />
        </>
      ),
      dataIndex: "payable_token",
      key: "payable_token",
      width: 150,
    },
    {
      title: (
        <>
          Quantity <TooltipIcon text="Amount of bidding asset in auction" />
        </>),
      dataIndex: "quantity",
      key: "quantity",
      width: 200,
    },
    {
      title: (
        <>
          End Time <TooltipIcon text="Auction closing time" />
        </>
      ),
      dataIndex: "end_time",
      key: "end_time",
      width: 200,
      render: (end_time) => <div className="endtime-badge">{end_time}</div>,
    },
    {
      title: (
        <>
          Top Bid <TooltipIcon text="Current HARBOR bid" />
        </>
      ),
      dataIndex: "max_bid",
      key: "max_bid",
      width: 150,
      render: (bid) => (
        <>
          <div className="assets-withicon display-center">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(bid?.denom)} />
            </div>
            {amountConversionWithComma(bid?.amount || 0)}{" "}
            {denomConversion(bid?.denom)}
          </div>
        </>
      ),
    },
    {
      title: (
        <>
          Bid
        </>
      ),
      dataIndex: "action",
      key: "action",
      align: "right",
      width: 140,
      render: (item) => (
        <>
          <PlaceBidModal
            params={params}
            auction={item}
            discount={params?.auctionDiscountPercent}
          />
        </>
      ),
    },
  ];

  console.log(auctions?.auctions, "auctions.auctions");

  const tableData =
    auctions && auctions?.auctions.length > 0
      ? auctions.auctions.map((item, index) => {
        return {
          key: index,
          id: item.id,
          auctioned_asset: (
            <>
              <div className="assets-withicon display-center">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(item?.auctionedToken?.denom)}
                  />
                </div>
                {denomConversion(item?.auctionedToken?.denom)}
              </div>
            </>
          ),
          payable_token: (
            <>
              <div className="assets-withicon">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(item?.expectedUserToken?.denom)}
                  />
                </div>
                {denomConversion(item?.expectedUserToken?.denom)}
              </div>
            </>
          ),
          quantity: (
            <>
              <div className="assets-withicon display-center">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(item?.expectedUserToken?.denom)}
                  />
                </div>
                {amountConversionWithComma(item?.expectedUserToken?.amount)} {" "}
                {denomConversion(item?.expectedUserToken?.denom)}
              </div>
            </>
          ),
          end_time: moment(item && item.endTime).format("MMM DD, YYYY HH:mm"),
          max_bid: item?.expectedMintedToken,
          action: item,
        };
      })
      : [];

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className={auctions?.auctions?.length > 0 ? "composite-card py-3" : "composite-card py-3 height-16 "}>
            <div className="card-content">
              <Table
                className="custom-table liquidation-table"
                dataSource={tableData}
                columns={columns}
                loading={inProgress}
                onChange={(event) => handleChange(event)}
                pagination={{ defaultPageSize: 10 }}
                scroll={{ x: "100%" }}
                locale={{ emptyText: <NoDataIcon /> }}
              />
            </div>
          </div>
          <div className="more-bottom mt-3">
            <h3 className="title">Bidding History</h3>
            <div className="more-bottom-card">
              <Row>
                <Col>
                  <Tabs
                    className="commodo-tabs mt-2"
                    onChange={callback}
                    activeKey={activeKey}
                    items={tabItems}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

DebtAuctions.propTypes = {
  lang: PropTypes.string.isRequired,
  setPairs: PropTypes.func.isRequired,
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
  setPairs,
};

export default connect(stateToProps, actionsToProps)(DebtAuctions);
