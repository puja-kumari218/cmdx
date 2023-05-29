import * as PropTypes from "prop-types";
import { Button, Modal } from 'antd';
import { useState } from 'react';
import React from "react";
import './index.scss';
import { SvgIcon } from "../../../components/common";
import { amountConversionWithComma } from "../../../utils/coin";
import { denomToSymbol, iconNameFromDenom } from "../../../utils/string";
import { DOLLAR_DECIMALS } from "../../../constants/common";

const ViewAllToolTip = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                {props?.btnText}
            </Button>
            <Modal
                title="External Incentives"
                width={350}
                centered={true}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className="viewAll-btn-modal"
                footer={false}
            >
                <>
                    {
                        props?.bribes && props?.bribes?.map((bribe, index) => {
                            return <div className="bribe-container mt-1" key={index}>
                                <span className="assets-withicon">
                                    <span className="assets-icon">
                                        <SvgIcon
                                            name={iconNameFromDenom(bribe?.denom)}
                                        />
                                    </span>
                                </span>
                                <span>{amountConversionWithComma(bribe?.amount, DOLLAR_DECIMALS)} {denomToSymbol(bribe?.denom)} </span>

                            </div>
                        })
                    }
                </>

            </Modal>
        </>
    );
};

ViewAllToolTip.propTypes = {
    text: PropTypes.string,
};

export default ViewAllToolTip;
