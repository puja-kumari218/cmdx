import { Button, message, Modal, Table } from 'antd'
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { useEffect, useState } from 'react'
import { Col, Row, SvgIcon } from '../../../../components/common'
import { PRODUCT_ID } from '../../../../constants/common';
import { setBalanceRefresh } from "../../../../actions/account";
import { claimableRewards } from '../../../../services/rewardContractsWrite';
import NoDataIcon from '../../../../components/common/NoDataIcon';
import { denomToSymbol } from '../../../../utils/string';
import { amountConversionWithComma } from '../../../../utils/coin';
import { transactionClaimRewards } from '../../../../services/rewardContractsRead';
import Snack from '../../../../components/common/Snack';
import variables from '../../../../utils/variables';
import { comdex } from '../../../../config/network';

const Reward = ({
    lang,
    address,
    refreshBalance,
    setBalanceRefresh,
}) => {
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [claimableRewardsData, setClaimableRewardsData] = useState()

    const showModal = () => {
        fetchClaimeableRewards(PRODUCT_ID, address)
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };


    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const fetchClaimeableRewards = (productId, address) => {
        setLoading(true)
        claimableRewards(productId, address).then((res) => {
            setClaimableRewardsData(res)
            setLoading(false)
        }).catch((error) => {
            console.log(error);
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchClaimeableRewards(PRODUCT_ID, address)
    }, [address, refreshBalance])

    const columns = [
        {
            title: (
                <>
                    Asset
                </>
            ),
            dataIndex: "asset",
            key: "asset",
            width: 150,
        },
        {
            title: (
                <>
                    You Earned{" "}
                </>
            ),
            dataIndex: "you_earned",
            key: "you_earned",
            width: 150,
            align: "right",
        },

    ];

    const tableData =
        claimableRewardsData && claimableRewardsData.map((item, index) => {
            return {
                key: index,
                asset: (
                    <>
                        <div className="assets-withicon">
                            <div className="assets-icon">
                                <SvgIcon
                                    name={iconNameFromDenom(
                                        item?.denom
                                    )}
                                />
                            </div>
                            {denomToSymbol(item.denom)}
                        </div>
                    </>
                ),
                you_earned: (
                    <>
                        <div className="assets-withicon display-right">
                            {amountConversionWithComma(item?.amount, DOLLAR_DECIMALS)} {denomToSymbol(item.denom)}
                        </div>
                    </>
                ),
            }
        })


    const claimReward = () => {
        setLoading(true)
        if (address) {
            transactionClaimRewards(address, PRODUCT_ID, (error, result) => {
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


    return (
        <>
            <Row >
                <div className="locker-up-main-container">
                    <div className="locker-up-container mr-4">
                        <div className="claim-container ">
                            <div className="claim-btn">
                                <Button
                                    type="primary"
                                    className="btn-filled"
                                    onClick={showModal}
                                >Claim Reward </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </Row>

            <Modal
                centered={true}
                className="palcebid-modal reward-collect-modal"
                footer={null}
                header={null}
                open={isModalVisible}
                width={550}
                closable={true}
                onOk={handleOk}
                loading={loading}
                onCancel={handleCancel}
            >
                <div className="palcebid-modal-inner rewards-modal-main-container">
                    <Row>
                        <Col>
                            <div className="rewards-title">
                                Claim Rewards
                            </div>
                        </Col>
                    </Row>

                    <Row style={{ paddingTop: 0 }}>
                        <Col>
                            <div className="card-content ">
                                <Table
                                    className="custom-table liquidation-table"
                                    dataSource={tableData}
                                    columns={columns}
                                    pagination={false}
                                    scroll={{ x: "100%" }}
                                    locale={{ emptyText: <NoDataIcon /> }}
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col className="diaplay-center flex">
                            <Button
                                type="primary"
                                className="btn-filled "
                                size="sm"
                                onClick={() => claimReward()}
                                loading={loading}
                                disabled={!claimableRewardsData?.length > 0}
                            >
                                Claim All
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    )
}

Reward.propTypes = {
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

export default connect(stateToProps, actionsToProps)(Reward);

// export default Reward