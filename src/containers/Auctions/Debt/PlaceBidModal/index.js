import * as PropTypes from "prop-types";
import { Button, Modal, message } from "antd";
import { Row, Col } from "../../../../components/common";
import { connect, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { comdex } from "../../../../config/network";
import variables from "../../../../utils/variables";
import { defaultFee } from "../../../../services/transaction";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import {
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from "../../../../utils/coin";
import Snack from "../../../../components/common/Snack";
import { ValidateInputNumber } from "../../../../config/_validation";
import { toDecimals } from "../../../../utils/string";
import CustomInput from "../../../../components/CustomInput";
import Long from "long";
import { PRODUCT_ID } from "../../../../constants/common";
import "./index.scss";
import moment from "moment";
import Timer from "../../../../components/Timer";
import { querySingleDebtAuction } from "../../../../services/auction";
import TooltipIcon from "../../../../components/TooltipIcon";

const PlaceBidModal = ({
  lang,
  address,
  auction,
  refreshBalance,
  params,
  balances,
}) => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();
  const [newCurrentAuction, setNewCurrentAuction] = useState(auction)



  const fetchSingleDebtAuction = (auctionId, auctionMappingId) => {
    querySingleDebtAuction(auctionId, auctionMappingId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setNewCurrentAuction(data?.auction)
    });
  };

  const showModal = () => {
    fetchSingleDebtAuction(auction?.auctionId, auction?.auctionMappingId);

    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.auction.v1beta1.MsgPlaceDebtBidRequest",
          value: {
            bidder: address,
            auctionId: auction?.auctionId,
            bid: {
              denom: auction?.expectedMintedToken?.denom,
              amount: getAmount(bidAmount),
            },
            expectedUserToken: {
              denom: auction?.expectedUserToken?.denom,
              amount: auction?.expectedUserToken?.amount,
            },
            appId: Long.fromNumber(PRODUCT_ID),
            auctionMappingId: params?.debtId,
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        setIsModalOpen(false);
        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        message.success(
          <Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        );
        setBidAmount()
        dispatch({
          type: "BALANCE_REFRESH_SET",
          value: refreshBalance + 1,
        });
      }
    );
  };

  const handleChange = (value) => {
    value = toDecimals(value).toString().trim();

    setValidationError(
      ValidateInputNumber(
        getAmount(value),
        getDenomBalance(balances, auction?.expectedMintedToken?.denom) || 0
      )
    );
    setBidAmount(value);
  };

  useEffect(() => {
    if (isModalOpen) {
      const interval = setInterval(() => {
        fetchSingleDebtAuction(auction?.auctionId, auction?.auctionMappingId)
      }, 5000)
      return () => {
        clearInterval(interval);
      }
    }
  }, [isModalOpen])

  return (
    <>
      <Button type="primary" size="small" className="px-3" onClick={showModal}>
        {" "}
        Place Bid{" "}
      </Button>
      <Modal
        centered={true}
        className="palcebid-modal auction-placebid-modal"
        footer={null}
        header={null}
        open={isModalOpen}
        width={550}
        closable={false}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={null}
      >
        <div className="palcebid-modal-inner">
          <Row>
            <Col sm="6">
              <p>Remaining Time </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                <Timer expiryTimestamp={newCurrentAuction && newCurrentAuction.endTime} />
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Bid Expiration In </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                <Timer expiryTimestamp={newCurrentAuction && newCurrentAuction.bidEndTime} />
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Lot Size <TooltipIcon text="The quantiy of CMST a user will pay" /> </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  newCurrentAuction?.expectedUserToken?.amount || 0
                )}{" "}
                {denomConversion(newCurrentAuction?.expectedUserToken?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Opening Bid </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  newCurrentAuction?.auctionedToken?.amount || 0
                )}{" "}
                {denomConversion(newCurrentAuction?.auctionedToken?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Top Bid </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  newCurrentAuction?.expectedMintedToken?.amount || 0
                )}{" "}
                {denomConversion(newCurrentAuction?.expectedMintedToken?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Your Bid <TooltipIcon text="Your bid in Harbor tokens should be lesser than the number in Top bid" /></p>
            </Col>
            <Col sm="6" className="text-right">
              <CustomInput
                value={bidAmount}
                onChange={(event) => handleChange(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Effective Bid Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {(
                  Number(newCurrentAuction?.expectedUserToken?.amount) /
                  Number(newCurrentAuction?.expectedMintedToken?.amount)
                ).toFixed(comdex.coinDecimals)}{" "}
                {`${denomConversion(
                  newCurrentAuction?.expectedUserToken?.denom
                )} / ${denomConversion(newCurrentAuction?.expectedMintedToken?.denom)}`}
              </label>
            </Col>
          </Row>
          <Row className="p-0">
            <Col className="text-center mt-3">
              <Button
                type="primary"
                className="btn-filled px-5"
                size="large"
                loading={inProgress}
                disabled={!Number(bidAmount) || inProgress}
                onClick={handleClick}
              >
                Place Bid
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

PlaceBidModal.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  auction: PropTypes.shape({
    minBid: PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    }),
    bid: PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    }),
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
  }),
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  bidAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  discount: PropTypes.shape({
    low: PropTypes.number,
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    bidAmount: state.auction.bidAmount,
    address: state.account.address,
    balances: state.account.balances.list,
    refreshBalance: state.account.refreshBalance,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(PlaceBidModal);
