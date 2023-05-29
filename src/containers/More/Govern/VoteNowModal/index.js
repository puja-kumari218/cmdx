import * as PropTypes from "prop-types";
import { Button, Radio, Modal, Space, message } from "antd";
import { Row, Col } from "../../../../components/common";
import { connect } from "react-redux";
import React, { useState } from "react";
import "./index.scss"
import { transactionForVote } from '../../../../services/contractsWrite'
import { useParams } from "react-router";
import { setVoteCount } from "../../../../actions/govern";
import Snack from "../../../../components/common/Snack";
import variables from "../../../../utils/variables";
import { comdex } from "../../../../config/network";

const VoteNowModal = ({
  lang,
  address,
  currentProposal,
  voteCount,
  setVoteCount,
  votingPower
}) => {
  const { proposalId } = useParams();
  let currentProposalId = Number(proposalId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userVote, setUserVote] = useState();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setLoading(true)
    if (address) {
      if (userVote) {
        transactionForVote(address, currentProposalId, userVote, (error, result) => {
          if (error) {
            message.error(error?.rawLog || "Transaction Failed")
            setLoading(false)
            return;
          }
          setVoteCount(voteCount + 1)
          message.success(
            < Snack
              message={variables[lang].tx_success}
              explorerUrlToTx={comdex?.explorerUrlToTx}
              hash={result?.transactionHash}
            />
          )
          setLoading(false)
          setIsModalOpen(false);
        })
      } else {
        setLoading(false)
        message.error("Please select a vote option")
      }
    }
    else {
      setLoading(false)
      message.error("Please Connect Wallet")
    }

  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div>
        <Button type="primary" className="btn-filled mb-n4" onClick={showModal} disabled={currentProposal?.status !== "open" || votingPower === "0.000000"} >Vote Now</Button>
      </div>
      <Modal
        centered={true}
        className="votenow-modal"
        footer={null}
        header={null}
        open={isModalOpen}
        width={550}
        closable={false}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={null}
      >
        <div className="votenow-modal-inner">
          <Row>
            <Col sm="12">
              <h3>Your Vote</h3>
              <p>#{currentProposal?.id || "-"} {currentProposal?.title || "---"}</p>
              <Radio.Group name="radiogroup" onChange={(e) => {
                setUserVote(e.target.value)

              }}>
                <Space direction="vertical">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                  <Radio value="veto">NoWithVeto</Radio>
                  <Radio value="abstain">Abstain</Radio>
                </Space>
              </Radio.Group>
            </Col>
          </Row>
          <Row className="p-0">
            <Col className="text-right mt-3">
              <Button type="primary" className="px-5 mr-3" size="large" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="primary" className="btn-filled px-5" size="large" onClick={handleOk} loading={loading} disabled={loading} >
                Confirm
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

VoteNowModal.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  currentProposal: PropTypes.array.isRequired,
  voteCount: PropTypes.number.isRequired
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    currentProposal: state.govern.currentProposal,
    voteCount: state.govern.voteCount,
  };
};

const actionsToProps = {
  setVoteCount,
};

export default connect(stateToProps, actionsToProps)(VoteNowModal);
