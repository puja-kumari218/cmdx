import "./index.scss";
import { Col, Row, SvgIcon } from "../../../components/common";
import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Checkbox, Slider } from "antd";
import CustomInput from "../../../components/CustomInput";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../../../constants/common";
import { queryPairs } from "../../../services/asset/query";
import { denomConversion } from "../../../utils/coin";
import { message } from "antd";
import { queryDutchAuctionList, queryFilterDutchAuctions } from "../../../services/auction";
import { setAuctions, setSelectedFilterAuctionAsset } from "../../../actions/auction";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const marks = {
  0: "00:00hrs",
  100: "3d:00h:00m",
};

const FilterModal = ({ address, pairs, setPairs }) => {
  const dispatch = useDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sliderValue, setSliderValue] = useState(0);
  let selectedAuctionedAsset = useSelector((state) => state.auction.selectedAuctionedAsset);

  useEffect(() => {
    if (!pairs?.list?.length) {
      fetchPairs(
        (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
        DEFAULT_PAGE_SIZE,
        true,
        false
      );
    }
  }, [address]);

  const fetchPairs = (offset, limit, countTotal, reverse) => {
    queryPairs(offset, 100, countTotal, reverse, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }

      setPairs(data.pairsInfo, data.pagination);
    });
  };

  const fetchFilteredDutchAuctions = (offset, limit, countTotal, reverse, asset) => {
    queryFilterDutchAuctions(offset, limit, countTotal, reverse, asset, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      dispatch(setAuctions(data));
    });
  };

  const fetchAuctions = (offset, limit, isTotal, isReverse) => {
    queryDutchAuctionList(
      offset,
      limit,
      isTotal,
      isReverse,
      (error, result) => {
        if (error) {
          message.error(error);
          return;
        }
        if (result?.auctions?.length > 0) {
          dispatch(setAuctions(result && result));
        }
        else {
          dispatch(setAuctions(""));
        }
      }
    );
  };

  const onCheckBoxInputChange = (e) => {
    if (e.target.checked) {
      selectedAuctionedAsset.push(e.target.defaultValue)
    } else {
      selectedAuctionedAsset = selectedAuctionedAsset.filter(item => item !== e.target.defaultValue)
    }
  }

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    if (selectedAuctionedAsset.length > 0) {
      dispatch(setSelectedFilterAuctionAsset(selectedAuctionedAsset));
      fetchFilteredDutchAuctions((pageNumber - 1) * pageSize, pageSize, true, false, selectedAuctionedAsset)
    } else {
      dispatch(setSelectedFilterAuctionAsset(selectedAuctionedAsset));
      fetchAuctions((pageNumber - 1) * pageSize, pageSize, true, false);
    }

    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        size="small"
        shape="round"
        className="filter-btn"
        onClick={showModal}
        style={{ border: "1px solid" }}
      >
        <SvgIcon name="filter" viewbox="0 0 13.579 13.385" /> Filter
      </Button>
      <Modal
        className="filter-modal"
        centered={true}
        closable={false}
        footer={null}
        open={isModalOpen}
        width={500}
        onCancel={handleCancel}
        onOk={handleOk}
        title={false}
      >
        <div className="filter-head">
          Filters
          <SvgIcon name="filter" viewbox="0 0 13.579 13.385" />
        </div>
        <Form layout="vertical">
          <Row>
            <Col>
              <label>Auctioned Asset</label>
              <div className="filter-rows">
                <Checkbox key={1} onChange={onCheckBoxInputChange} defaultValue="ucmdx">{denomConversion("ucmdx")}</Checkbox>
                <Checkbox key={2} onChange={onCheckBoxInputChange} defaultValue="uatom">{denomConversion("uatom")}</Checkbox>
                <Checkbox key={3} onChange={onCheckBoxInputChange} defaultValue="uosmo">{denomConversion("uosmo")}</Checkbox>
              </div>
            </Col>
          </Row>


          <Row className="text-center mt-3">
            <Col>
              <Button
                block
                type="primary"
                size="large"
                className="px-5"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                block
                type="primary"
                size="large"
                className="btn-filled px-5"
                onClick={handleOk}
              >
                Apply
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default FilterModal;
