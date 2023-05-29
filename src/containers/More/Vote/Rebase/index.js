import { Button, message, Modal, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from '../../../../components/common'
import NoDataIcon from '../../../../components/common/NoDataIcon'
import Snack from '../../../../components/common/Snack'
import { comdex } from '../../../../config/network'
import { transactionForClaimRebase } from '../../../../services/rebaseingContractWrite'
import variables from '../../../../utils/variables'
import { setBalanceRefresh } from "../../../../actions/account";
import { totalClaimableRebase } from '../../../../services/rebasingContractRead'
import { PRODUCT_ID } from '../../../../constants/common'
import { iconNameFromDenom } from '../../../../utils/string'
import { amountConversionWithComma } from '../../../../utils/coin'
import TooltipIcon from '../../../../components/TooltipIcon'

const Rebase = ({
    lang,
    address,
    refreshBalance,
    setBalanceRefresh,
}) => {
    const [isRebasingModalVisible, setIsRebasingModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claimableRebaseData, setClaimableRebaseData] = useState()

    const showRebasingModal = () => {
        setIsRebasingModalVisible(true);
    };

    const handleRebasingOk = () => {
        setIsRebasingModalVisible(false);
    };

    const handleRebasingCancel = () => {
        setIsRebasingModalVisible(false);
    };



    const fetchClaimeableRebase = (productId, address) => {
        setLoading(true)
        totalClaimableRebase(productId, address).then((res) => {
            setClaimableRebaseData(res)
            setLoading(false)
        }).catch((error) => {
            console.log(error);
            setLoading(false)
        })
    }

    const claimRebase = (proposalId) => {
        setCurrent(proposalId)
        setLoading(true)
        if (address) {
            transactionForClaimRebase(address, PRODUCT_ID, proposalId, (error, result) => {
                if (error) {
                    message.error(error?.rawLog || "Transaction Failed")
                    setLoading(false)
                    return;
                }
                message.success(
                    < Snack
                        message={variables[lang].tx_success}
                        explorerUrlToTx={comdex?.explorerUrlToTx}
                        hash={result?.transactionHash}
                    />
                )
                setBalanceRefresh(refreshBalance + 1);
                setLoading(false)
            })
        }
        else {
            setLoading(false)
            message.error("Please Connect Wallet")
        }
    }

    useEffect(() => {
        fetchClaimeableRebase(PRODUCT_ID, address)
    }, [address, refreshBalance])

    const rebasingColumns = [
        {
            title: (
                <>
                    No. of Weeks
                </>
            ),
            dataIndex: "epocId",
            key: "epocId",
            width: 150,
        },
        {
            title: (
                <>
                    Rebase Amount <TooltipIcon text="Eligible Harbor rebase amount " />
                </>
            ),
            dataIndex: "rebaseAmount",
            key: "rebaseAmount",
            width: 250,
        },
        {
            title: (
                <>
                    Action <TooltipIcon text="Action button to claim rebase" />
                </>
            ),
            dataIndex: "claim",
            key: "claim",
            width: 150,
            align: "right",
        },

    ];

    const rebasingTableData =
        claimableRebaseData && claimableRebaseData.length > 0 &&
        claimableRebaseData?.map((item) => {
            return (
                {
                    key: item?.proposal_id,
                    epocId: item?.proposal_id,
                    rebaseAmount: (
                        <>
                            <div className="assets-withicon justify-content-center mr-2">
                                <div className="assets-icon">
                                    <SvgIcon
                                        name={iconNameFromDenom(
                                            "uharbor"
                                        )}
                                    />
                                </div>
                                {amountConversionWithComma(item?.rebase_amount || 0)}
                            </div>
                        </>
                    ),
                    claim: (
                        <Button
                            type="primary"
                            className="btn-filled"
                            loading={item?.proposal_id === current ? loading : false}
                            disabled={loading}
                            onClick={() => claimRebase(item?.proposal_id)}
                        >
                            Claim
                        </Button>
                    )
                }
            )

        })


    return (
        <>
            <Row >
                <div className="locker-up-main-container">
                    <div className="locker-up-container">
                        <div className="claim-container">
                            <div className="claim-btn">
                                <Button
                                    type="primary"
                                    className="btn-filled"
                                    onClick={showRebasingModal}
                                >Claim Rebase </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </Row>
            <div>
                <Modal
                    centered={true}
                    className="palcebid-modal reward-collect-modal"
                    footer={null}
                    header={null}
                    open={isRebasingModalVisible}
                    width={600}
                    closable={true}
                    onOk={handleRebasingOk}
                    loading={loading}
                    onCancel={handleRebasingCancel}
                >
                    <div className="palcebid-modal-inner rewards-modal-main-container">
                        <Row>
                            <Col>
                                <div className="rewards-title">
                                    Claim Rebase
                                </div>
                            </Col>
                        </Row>

                        <Row style={{ paddingTop: 0 }}>
                            <Col>
                                <div className="card-content ">
                                    <Table
                                        className="custom-table liquidation-table"
                                        dataSource={rebasingTableData}
                                        columns={rebasingColumns}
                                        pagination={false}
                                        scroll={{ x: "100%" }}
                                        locale={{ emptyText: <NoDataIcon /> }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Modal>
            </div>
        </>
    )
}

Rebase.propTypes = {
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
};

export default connect(stateToProps, actionsToProps)(Rebase);

// export default Rebase