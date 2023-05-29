import { Button, Input, message, Modal } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import Lottie from 'react-lottie';
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import {
  setAccountAddress,
  setAccountName
} from "../../../../actions/account";
import { setuserEligibilityData } from "../../../../actions/airdrop";
import celebrationAnimation from '../../../../assets/lottefiles/74680-confetti.json';
import { Col, Row, SvgIcon } from "../../../../components/common";
import Snack from "../../../../components/common/Snack";
import Copy from "../../../../components/Copy";
import { chainNetworks } from "../../../../config/magixTx_chain_config";
import { TOTAL_ACTIVITY, TOTAL_VEHARBOR_ACTIVITY } from "../../../../constants/common";
import { checkEligibility } from "../../../../services/airdropContractRead";
import { eligibilityCheckTracker } from "../../../../services/airdropEligiblityTracker";
import { Fee, MsgSendTokens, signAndBroadcastMagicTransaction } from "../../../../services/helper";
import { magicInitializeChain } from "../../../../services/keplr";
import { amountConversionWithComma } from "../../../../utils/coin";
import variables from "../../../../utils/variables";
import "./index.scss";

const ChainModal = ({
  currentChain,
  lang,
  address,
  refreshBalance,
  userEligibilityData,
  setuserEligibilityData,
  setAccountAddress,
  setAccountName,
}) => {
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false)
  const [userAddress, setUserAddress] = useState("");
  const [userComdexAddress, setuserComdexAddress] = useState("")
  const [userCurrentChainAddress, setUserCurrentChainAddress] = useState("")
  const [txLogin, setTxLogin] = useState(false);
  const [disableTxBtn, setDisableTxBtn] = useState(true)
  const [isOpen, setIsOpen] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: celebrationAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const shareText =
    `
Hi Guys! %0A
I am eligible for the $HARBOR airdrop by @Harbor_Protocol🤩 %0A %0A

You may also check your eligibility for the airdrop via👇
https://app.harborprotocol.one/more/airdrop  %0A%0A

Harbor Protocol is the Interchain Stablecoin Protocol built on the @ComdexOfficial chain. %0A %0A

$HARBOR   $CMST`

  // Query 
  const fetchCheckEligibility = (address, chainId) => {
    setLoading(true)
    checkEligibility(address, chainId).then((res) => {
      if (res) {
        setDisableTxBtn(false)
        setIsModalVisible(false)
        setIsOpen(true)
      }
      else {
        message.error("Sorry you are not Eligible! 🙁")
      }
      setuserEligibilityData(res)

      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  }

  const showModal = () => {
    setuserEligibilityData(0)
    if (address) {
      magicInitializeChain(chainNetworks[currentChain?.networkname], (error, account) => {
        if (error) {
          console.log(error, "error");
          message.error(error);
          return;
        }
        setUserCurrentChainAddress(account?.address)
      });


      checkEligibility(address, currentChain?.chainId).then((res) => {
        if (res) {
          message.success("Magic Transaction already completed! 👍")
          navigate(`./complete-mission/${currentChain?.chainId}`)
        }
      }).catch((error) => {
        console.log(error);
      })

      setIsModalVisible(true);
    } else {
      message.error("Please connect  wallet!")
    }

  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setuserEligibilityData(0)
    setIsModalVisible(false);
  };

  const handleElegibleModalCancel = () => {
    setIsOpen(false);
  };

  const checkChainAddressEligibility = (userAddress) => {
    eligibilityCheckTracker(currentChain?.chainId, userAddress, (error, result) => {
      if (error) {
        console.log(error, "Eligibility Request");
        return;
      }
    })
    fetchCheckEligibility(userAddress, currentChain?.chainId)
  }

  const handleClickMagicTx = () => {
    setTxLogin(true);
    let msg = MsgSendTokens(
      userCurrentChainAddress,
      currentChain?.magicTxAdd,
      chainNetworks[currentChain?.networkname],
      1
    );
    signAndBroadcastMagicTransaction(
      {
        message: msg,
        fee: Fee(0, 250000, chainNetworks[currentChain?.networkname]),
        memo: userComdexAddress,
      },
      userCurrentChainAddress,
      chainNetworks[currentChain?.networkname],
      (error, result) => {
        if (error) {
          message.error(error)
          setTxLogin(false);
          return;
        }
        if (result && !result?.code) {
          message.success(
            <Snack
              message={variables[lang].tx_success}
              explorerUrlToTx={chainNetworks[currentChain?.networkname].explorerUrlToTx}
              hash={result?.transactionHash}
            />
          )
        } else {
          message.error(result?.rawLog || "Transaction failed")
          console.log(result?.rawLog);
        }
        setTxLogin(false);

      }
    );
  }

  useEffect(() => {
    setUserAddress(userCurrentChainAddress)
  }, [address, userCurrentChainAddress])

  useEffect(() => {
    setuserComdexAddress(address)
  }, [address])

  useEffect(() => {
    if (isModalVisible) {
      checkEligibility(userAddress, currentChain?.chainId).then((res) => {
        if (res) {
          setDisableTxBtn(false)
        }
      }).catch((error) => {
      })
    }

  }, [userAddress])


  return (
    <>
      <Button disabled className="icons" onClick={showModal}>
        <div className="icon-inner" >
          <img src={currentChain?.icon} alt="" />
        </div>
      </Button>

      <Modal
        className="claimrewards-modal"
        centered={true}
        closable={false}
        footer={null}
        open={isModalVisible}
        width={685}
        onCancel={handleCancel}
        onOk={handleOk}
        closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
        title={
          <div className="claim-box-modal-main-head">
            <div className="title-head">
              <div className="icons" onClick={showModal}>
                <div className="icon-inner">
                  <img src={currentChain?.icon} alt="" />
                </div>
              </div>
              <span>{currentChain?.chainName}</span>
            </div>
            <div className="mission-complete-btn">
              <Link to={`./complete-mission/${currentChain?.chainId}`}><Button type="primary" size="small" className="btn-filled">Complete Mission</Button></Link>
            </div>
          </div>
        }
      >
        <Row className="mb-4">
          <Col>
            <label>Check Eligibility</label>
            <div className="d-flex">
              <Input onChange={(e) => setUserAddress(e.target.value)} value={userAddress} placeholder={`Enter Your ${currentChain?.chainName} Wallet Address`} /> <Button type="primary" className="btn-filled" loading={loading} onClick={() => checkChainAddressEligibility(userAddress)}>Check</Button>
            </div>
          </Col>
        </Row>

        {
          currentChain?.chainId != 4 && currentChain?.chainId != 5 && currentChain?.chainId != 8 && (
            <Row>
              <Col>
                <label>Magic Transaction</label>
                <div className="d-flex">
                  <Input placeholder={`Enter Your Comdex Wallet Address`} value={userComdexAddress} onChange={(e) => setuserComdexAddress(e.target.value)} />
                  <Button type="primary" className="btn-filled"
                    loading={txLogin}
                    disabled={
                      disableTxBtn ||
                      txLogin
                    }
                    onClick={() => handleClickMagicTx()} >
                    Transaction
                  </Button>
                </div>
              </Col>
            </Row>
          )
        }


        <Row className="mt-4">
          <Col>
            <label style={{ width: "100%" }}>
              <div className="hr-line">
                <div className="line-1"></div>
                <div className="text">OR</div>
                <div className="line-2"></div>
              </div>
            </label>
            <div className="address-text-container">
              <div className="address"> <span className="lable">Magic Txn Address : </span> <span className="admin-address"> {currentChain?.magicTxAdd}</span>  <span className="modal-address-copy-icon">{<Copy text={currentChain?.magicTxAdd} />}</span></div>
              <div className="address"> <span className="lable">Amount to be Sent : </span> <span className="admin-address"> {currentChain?.coinDecimal}</span>  <span className="modal-address-copy-icon">{<Copy text={currentChain?.coinDecimal} />}</span></div>
            </div>
            <div className="error-text mb-4"><SvgIcon name="info" viewbox="0 0 16.25 16.25" /> Copy the above shown  amount  and send {currentChain?.chainName} to the above address. Users need to input their Comdex address in MEMO. Magic Txn settlement can take upto 10-12 Hrs. </div>
          </Col>
        </Row>

      </Modal>

      <div className="eligibility-modal-container">
        <Modal
          centered={true}
          className="disclaimer-modal"
          footer={null}
          header={null}
          open={isOpen}
          closable={true}
          width={700}
          isHidecloseButton={true}
          onCancel={handleElegibleModalCancel}
          closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
          maskStyle={{ background: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="eligiblity-inner-modal-title">
            <h2>Congrats! You are Eligible for <br />  <b>{amountConversionWithComma(userEligibilityData?.claimable_amount / TOTAL_ACTIVITY || 0)} $HARBOR</b>  & <b>{amountConversionWithComma((Number(userEligibilityData?.claimable_amount / TOTAL_ACTIVITY) * Number(TOTAL_VEHARBOR_ACTIVITY)) || 0)} $veHARBOR</b> </h2>

            <div className="description-text">
              <p>
                <Lottie
                  options={defaultOptions}
                  height={100}
                  width={200}
                />
              </p>
            </div>
            <p>Share with your friends</p>
            <div className="text-center mt-4">
            </div>
            <div className="d-flex agree-btn">
              <div className="share-btn-main-container">
                <div className="twitter-btn-container airdrop-share-btn">
                  <a href={`https://twitter.com/intent/tweet?original_referer&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&text=${shareText}`} target="_blank"> <SvgIcon name="twitter" viewbox="0 0 22 25" /></a>
                </div>

              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

ChainModal.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  setAccountName: PropTypes.func.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
    userEligibilityData: state.airdrop.userEligibilityData,
  };
};

const actionsToProps = {
  setuserEligibilityData,
  setAccountAddress,
  setAccountName,
};

export default connect(stateToProps, actionsToProps)(ChainModal);