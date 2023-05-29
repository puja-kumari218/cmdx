import { Button, message } from 'antd';
import Long from 'long';
import * as PropTypes from "prop-types";
import React, { useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Col } from '../../../components/common';
import Snack from '../../../components/common/Snack';
import TooltipIcon from '../../../components/TooltipIcon';
import { PRODUCT_ID } from '../../../constants/common';
import { signAndBroadcastTransaction } from '../../../services/helper';
import { defaultFee } from '../../../services/transaction';
import { amountConversionWithComma, denomConversion } from '../../../utils/coin';
import variables from '../../../utils/variables';
import { setLockerDefaultSelectTab } from "../../../actions/locker";


const CloseLocker = ({ lang, address, ownerLockerInfo, whiteListedAsset, refreshBalance, setLockerDefaultSelectTab }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userBalanceInLocker = amountConversionWithComma(ownerLockerInfo?.netBalance || 0);
    const isLockerExist = useSelector((state) => state.locker.isLockerExist);
    const lockerId = ownerLockerInfo?.lockerId;
    const whiteListedAssetId = whiteListedAsset[0]?.toNumber();
    const [inProgress, setInProgress] = useState(false);

    const handleCloseLocker = () => {
        if (!address) {
            message.error("Address not found, please connect to Keplr");
            return;
        }
        setInProgress(true);
        message.info("Transaction initiated");
        signAndBroadcastTransaction(
            {
                message: {
                    typeUrl: "/comdex.locker.v1beta1.MsgCloseLockerRequest",
                    value: {
                        depositor: address,
                        appId: Long.fromNumber(PRODUCT_ID),
                        assetId: Long.fromNumber(whiteListedAssetId),
                        lockerId: lockerId,
                    },
                },
                fee: defaultFee(),
            },
            address,
            (error, result) => {
                setInProgress(false);
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
                        hash={result?.transactionHash}
                    />
                );
                setLockerDefaultSelectTab("1")
                dispatch({
                    type: "BALANCE_REFRESH_SET",
                    value: refreshBalance + 1,
                });
            }
        );
    }
    return (
        <>
            <Col>
                <div className="farm-content-card earn-deposite-card earn-main-deposite locker-close-card">
                    <div className="locker-title">  Close Locker</div>
                    <div className="assets-select-card locker-close-card-details  ">
                        <div className="assets-left">
                            <label className="leftlabel">
                                Net Receivable  <TooltipIcon text="Total receivable Composite" />
                            </label>
                        </div>
                        <div className="assets-right">
                            <div className="label-right">
                                {userBalanceInLocker} {" "}
                                {denomConversion("ucmst")}
                            </div>

                        </div>
                    </div>

                    <div className="assets PoolSelect-btn">
                        <div className="assets-form-btn text-center  mb-2">
                            <Button
                                loading={inProgress}
                                disabled={
                                    inProgress
                                }
                                type="primary"
                                className="btn-filled"
                                onClick={() => {
                                    if (isLockerExist) {
                                        handleCloseLocker()
                                    }
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Col>
        </>
    )
}

CloseLocker.propTypes = {
    address: PropTypes.string.isRequired,
    ownerLockerInfo: PropTypes.array,
    whiteListedAsset: PropTypes.arrayOf(
        PropTypes.shape({
            list: PropTypes.shape({
                id: PropTypes.shape({
                    low: PropTypes.number,
                    high: PropTypes.number,
                    inSigned: PropTypes.number,
                }),
            }),
        })
    ),
    refreshBalance: PropTypes.number.isRequired,
};
const stateToProps = (state) => {
    return {
        address: state.account.address,
        lang: state.language,
        ownerLockerInfo: state.locker.ownerVaultInfo,
        whiteListedAsset: state.locker.whiteListedAssetById.list,
        refreshBalance: state.account.refreshBalance,
    };
};
const actionsToProps = {
    setLockerDefaultSelectTab,
};
export default connect(stateToProps, actionsToProps)(CloseLocker);