import { message, Pagination, Spin } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
    setCurrentPairID,
    setSelectedExtentedPairvault
} from "../../actions/locker";
import { setStableMintVaultList } from "../../actions/stableMint";
import { SvgIcon } from "../../components/common";
import NoData from "../../components/NoData";
import TooltipIcon from "../../components/TooltipIcon";
import { DEFAULT_PAGE_NUMBER, DOLLAR_DECIMALS, PRODUCT_ID } from "../../constants/common";
import { queryPairVault } from "../../services/asset/query";
import { queryStableVault, queryVaultMintedStatistic } from "../../services/vault/query";
import { amountConversionWithComma } from "../../utils/coin";
import { decimalConversion } from "../../utils/number";
import { iconNameFromDenom, symbolToDenom } from "../../utils/string";
import './index.scss';


const StableMint = ({
    address,
    lang
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const navigateToStableMintVault = (path) => {
        navigate({
            pathname: `./${path}`,
        });
    };

    const stableMintExtenedPairVaultList = useSelector(
        (state) => state.stableMint.stableMintVaultList
    );


    const [loading, setLoading] = useState(true);
    const [vaultDebt, setVaultDebt] = useState([])
    const [activePage, setActivePage] = useState(DEFAULT_PAGE_NUMBER)
    const [totalExtendedPair, setTotalExtendedPair] = useState({})
    const [stableMintExtendedPairIdData, setStableMintExtendedPairIdData] = useState();


    const fetchExtendexPairList = (pairId) => {
        setLoading(true);
        queryPairVault(pairId, (error, data) => {

            if (error) {
                message.error(error);
                setLoading(false);
                return;
            }
            setTotalExtendedPair(datas => ({
                ...datas,
                [pairId]: data?.pairVault
            }))
            setLoading(false);
        });
    };

    const fetchVaultMintedTokenStatistic = (productId) => {
        queryVaultMintedStatistic(productId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setVaultDebt((vaultDebt) => [...vaultDebt, data?.pairStatisticData])
        });
    };

    const fetchStableVault = (productId) => {
        setLoading(true);
        queryStableVault(productId, (error, data) => {
            if (error) {
                message.error(error);
                setLoading(false);
                return;
            }
            setStableMintExtendedPairIdData(data?.stableMintVault);
            setLoading(false);
        });
    };

    const getStableMintExtendexPairValut = () => {
        stableMintExtendedPairIdData && stableMintExtendedPairIdData?.map((item) => {
            fetchExtendexPairList(item?.extendedPairVaultId?.toNumber())
        })
        dispatch(setStableMintVaultList(totalExtendedPair));
    }

    const getIconFromPairName = (extendexPairVaultPairName) => {
        if(extendexPairVaultPairName === "GRAV-USDC-CMST"){
            return "gusdc" // returning denom
        }
        if(extendexPairVaultPairName === "GRAV-DAI-CMST"){
            return "gdai" // returning denom
        }
        let pairName = extendexPairVaultPairName;
        pairName = pairName?.replace(/\s+/g, ' ').trim()
        pairName = pairName?.substring(pairName?.indexOf('-') + 1);
        pairName = pairName?.substring(0, pairName?.indexOf('-'));
        pairName = pairName?.toLowerCase();

        return pairName;
    }

    const calculateGlobalDebt = (value) => {
        let matchData = vaultDebt[0]?.filter((debt) => debt?.extendedPairVaultId?.toNumber() === value?.id?.toNumber())
        if (matchData[0] && amountConversionWithComma(matchData[0]?.mintedAmount)) {
            return amountConversionWithComma(matchData[0]?.mintedAmount, DOLLAR_DECIMALS);
        }
        return (0).toFixed(6)
    }

    useEffect(() => {
        fetchStableVault()
    }, [address])

    useEffect(() => {
        if (Object.keys(stableMintExtenedPairVaultList && stableMintExtenedPairVaultList)?.length > 0) {
            fetchVaultMintedTokenStatistic(PRODUCT_ID)
        }
    }, [address, stableMintExtenedPairVaultList])

    useEffect(() => {
        if (stableMintExtendedPairIdData?.length > 0) {
            getStableMintExtendexPairValut()
        }
    }, [address, stableMintExtendedPairIdData])

    useEffect(() => {
        dispatch(setStableMintVaultList(totalExtendedPair));
    }, [totalExtendedPair])


    if (loading) {
        return <Spin />;
    }

    return (
        <>
            <div className="app-content-wrapper vault-mint-main-container">
                <div className="card-main-container">
                    {Object.keys(stableMintExtenedPairVaultList && stableMintExtenedPairVaultList)?.length > 0 ? <h1 className="choose-vault">Choose Your Stable Mint Vault Type</h1> : ""}
                    {Object.keys(stableMintExtenedPairVaultList && stableMintExtenedPairVaultList)?.length > 0 ? (
                        Object.values(stableMintExtenedPairVaultList && stableMintExtenedPairVaultList).map((item, index) => {
                            if (
                                item &&
                                item.isStableMintVault &&
                                item.appId.toNumber() === PRODUCT_ID
                            ) {
                                return (
                                    <React.Fragment key={index}>
                                        {item &&
                                            (
                                                <div
                                                    className="card-container "
                                                    onClick={() => {
                                                        dispatch(setCurrentPairID(item?.pairId?.toNumber()));
                                                        dispatch(setSelectedExtentedPairvault(item));
                                                        navigateToStableMintVault(item?.id?.toNumber());
                                                    }}
                                                >
                                                    <div className="up-container">
                                                        <div className="icon-container">
                                                            <SvgIcon name={iconNameFromDenom(symbolToDenom(getIconFromPairName(item?.pairName)))} />
                                                        </div>
                                                        <div className="vault-name-container">
                                                            <div className="vault-name">{item?.pairName}</div>
                                                            <div className="vault-desc" />
                                                        </div>
                                                    </div>
                                                    <div className="bottom-container">
                                                        <div className="contenet-container">
                                                            <div className="name">
                                                                Drawdown Fee <TooltipIcon text="Fixed amount of $CMST deducted at every withdrawal" />
                                                            </div>
                                                            <div className="value">
                                                                {" "}
                                                                {decimalConversion(item?.drawDownFee) * 100 || "0"}%
                                                            </div>
                                                        </div>
                                                        <div className="contenet-container">
                                                            <div className="name">
                                                                Debt Ceiling <TooltipIcon text="Maximum Composite that can be withdrawn per vault type" />
                                                            </div>
                                                            <div className="value">
                                                                {" "}
                                                                {amountConversionWithComma(item?.debtCeiling, DOLLAR_DECIMALS)} CMST
                                                            </div>
                                                        </div>

                                                        <div className="contenet-container">
                                                            <div className="name">
                                                                Vault’s Global Debt <TooltipIcon text="The total $CMST Debt of the protocol against this vault type" />
                                                            </div>
                                                            <div className="value">
                                                                {vaultDebt.length > 0
                                                                    ?
                                                                    calculateGlobalDebt(item)
                                                                    :
                                                                    "0.000000"
                                                                } CMST
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                    </React.Fragment>
                                );
                            }
                            else {
                                return ""
                            }
                        })
                    )
                        : (
                            <NoData />
                        )}


                </div>
                {stableMintExtenedPairVaultList?.length > 0 ? <div >
                    <Pagination
                        defaultCurrent={activePage}
                        pagination={{ defaultPageSize: 6 }}
                    />
                </div> : ""}
            </div >
        </>
    )
}

StableMint.propTypes = {
    lang: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
};

const stateToProps = (state) => {
    return {
        lang: state.language,
        address: state.account.address,
    };
};

const actionsToProps = {

};

export default connect(stateToProps, actionsToProps)(StableMint);

