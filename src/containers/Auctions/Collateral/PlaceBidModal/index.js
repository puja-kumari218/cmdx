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
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  orderPriceConversion,
} from "../../../../utils/coin";
import { setBalanceRefresh } from "../../../../actions/account";
import Snack from "../../../../components/common/Snack";
import { ValidateInputNumber } from "../../../../config/_validation";
import { toDecimals } from "../../../../utils/string";
import CustomInput from "../../../../components/CustomInput";
import Long from "long";
import { DOLLAR_DECIMALS, PRODUCT_ID } from "../../../../constants/common";
import "./index.scss";
import { commaSeparator, decimalConversion, marketPrice } from "../../../../utils/number";
import Timer from "../../../../components/Timer";
import { querySingleDutchAuction } from "../../../../services/auction";

const PlaceBidModal = ({
  lang,
  address,
  auction,
  params,
  assetMap,
  refreshBalance,
  markets,
}) => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCurrentAuction, setNewCurrentAuction] = useState(auction)
  const [bidAmount, setBidAmount] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();
  const [calculatedQuantityBid, setCalculatedQuantityBid] = useState();

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }

  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
  }

  const { height, width } = useWindowDimensions();


  const fetchSingleDutchAuctions = (auctionId, auctionMappingId) => {
    querySingleDutchAuction(auctionId, auctionMappingId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setNewCurrentAuction(data?.auction)
    });
  };

  const showModal = () => {
    fetchSingleDutchAuctions(auction?.auctionId, auction?.auctionMappingId);
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
          typeUrl: "/comdex.auction.v1beta1.MsgPlaceDutchBidRequest",
          value: {
            bidder: address,
            auctionId: newCurrentAuction?.auctionId,
            amount: {
              denom: newCurrentAuction?.outflowTokenInitAmount?.denom,
              amount: getAmount(bidAmount, assetMap[newCurrentAuction?.outflowTokenCurrentAmount?.denom]?.decimals),
            },
            appId: Long.fromNumber(PRODUCT_ID),
            auctionMappingId: params?.dutchId,
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
          setBidAmount(0);
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }
        setBidAmount(0);
        message.success(
          <Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        );
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
        value,
        Number(amountConversion(newCurrentAuction?.outflowTokenCurrentAmount?.amount, comdex?.coinDecimals, assetMap[newCurrentAuction?.outflowTokenCurrentAmount?.denom]?.decimals) || 0), "", "", "Bid must be less than Auction Quantity"
      )
    );
    setBidAmount(value);
  };


  const calculateQuantityBidFor = () => {

    let calculatedAmount = Number(bidAmount * Number(
      amountConversion(
        decimalConversion(newCurrentAuction?.outflowTokenCurrentPrice) || 0, comdex?.coinDecimals, assetMap[newCurrentAuction?.outflowTokenCurrentPrice?.denom]?.decimals
      )
    )
    ).toFixed(6);
    setCalculatedQuantityBid(calculatedAmount);
  }

  useEffect(() => {
    calculateQuantityBidFor()
  }, [bidAmount, newCurrentAuction?.outflowTokenCurrentPrice])

  useEffect(() => {
    if (isModalOpen) {
      const interval = setInterval(() => {
        fetchSingleDutchAuctions(auction?.auctionId, auction?.auctionMappingId)
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
        width={500}
        closable={(width < 650) ? true : null}
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
              <p>Oracle Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label> $
                {
                  commaSeparator(Number(marketPrice(markets, newCurrentAuction?.outflowTokenCurrentAmount?.denom, assetMap[newCurrentAuction?.outflowTokenCurrentAmount?.denom]?.id) || 0).toFixed(4))
                }
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p>Opening Auction Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label> $
                {
                  commaSeparator(
                    Number(
                      amountConversion(
                        decimalConversion(newCurrentAuction?.outflowTokenInitialPrice || 0) || 0, 4
                      ) || 0
                    )
                  )
                }
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Current Auction Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                $
                {commaSeparator(
                  Number(
                    amountConversion(
                      decimalConversion(newCurrentAuction?.outflowTokenCurrentPrice) || 0, 4
                    ) || 0
                  )
                )}
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p>Auctioned Quantity </p>
            </Col>
            <Col sm="6" className="text-right" >
              <label >
                {amountConversionWithComma(
                  newCurrentAuction?.outflowTokenCurrentAmount?.amount || 0, comdex?.coinDecimals, assetMap[newCurrentAuction?.outflowTokenCurrentAmount?.denom]?.decimals
                )} {denomConversion(newCurrentAuction?.outflowTokenCurrentAmount?.denom)}
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p> Target CMST</p>
            </Col>
            <Col sm="6" className="text-right">
              <label >
                {commaSeparator(
                  Number(amountConversion(newCurrentAuction?.inflowTokenTargetAmount?.amount, comdex?.coinDecimals, assetMap[newCurrentAuction?.inflowTokenCurrentAmount?.denom]?.decimals) - amountConversion(newCurrentAuction?.inflowTokenCurrentAmount?.amount, comdex?.coinDecimals, assetMap[newCurrentAuction?.inflowTokenCurrentAmount?.denom]?.decimals)).toFixed(6) || 0
                )} {denomConversion(newCurrentAuction?.inflowTokenCurrentAmount?.denom)}
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p>Quantity Bid For</p>
            </Col>
            <Col sm="6" className="text-right auction-quantity-max-btn-main-container">
              <CustomInput
                value={bidAmount}
                onChange={(event) => handleChange(event.target.value)}
                validationError={validationError}
              />
              <label><div className="input-denom">{denomConversion(newCurrentAuction?.outflowTokenCurrentAmount?.denom)}</div></label>
              <div className="auction-quantity-max-btn"><button
                onClick={() => {
                  handleChange((amountConversion(newCurrentAuction?.outflowTokenCurrentAmount?.amount || 0, comdex?.coinDecimals, assetMap[newCurrentAuction?.outflowTokenCurrentAmount?.denom]?.decimals)))
                }}>
                Max
              </button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Your CMST Bid</p>
            </Col>
            <Col sm="6" className="text-right">
              <label >
                {calculatedQuantityBid}{" "}
                {denomConversion(newCurrentAuction?.inflowTokenCurrentAmount?.denom)}
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
                disabled={!Number(bidAmount) || validationError?.message}
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
  assetMap: PropTypes.object,
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
  markets: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    bidAmount: state.auction.bidAmount,
    address: state.account.address,
    balances: state.account.balances.list,
    assetMap: state.asset.map,
    refreshBalance: state.account.refreshBalance,
    markets: state.oracle.market,
  };
};

const actionsToProps = {
  setBalanceRefresh,
};

export default connect(stateToProps, actionsToProps)(PlaceBidModal);
