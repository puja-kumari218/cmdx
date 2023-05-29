import { message } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Col, Row } from "../../components/common";
import TooltipIcon from "../../components/TooltipIcon";
import { comdex, ibcDenoms } from "../../config/network";
import { DOLLAR_DECIMALS, ZERO_DOLLAR_DECIMALS } from "../../constants/common";
import { fetchDashboardDollorTVL, fetchDashboardMintedCMSTTVL } from "../../services/oracle/query";
import { amountConversion } from "../../utils/coin";
import { commaSeparator } from "../../utils/number";
import variables from "../../utils/variables";
import Banner from "./Banner";
import "./index.scss";

const Dashboard = ({ lang, isDarkMode, markets, assetMap, harborPrice }) => {
  const [totalValueLocked, setTotalValueLocked] = useState();
  const [totalDollarValue, setTotalDollarValue] = useState();
  const [uniqueCMSTMintedData, setUniqueCMSTMintedData] = useState();
  const [totalMintedCMST, setTotalMintedCMST] = useState();


  const calculateTotalValueLockedInDollarForOthers = () => {
    let amount = 0;
    if (totalDollarValue) {
      amount =
        Number(totalDollarValue) -
        (Number(totalValueLocked?.[ibcDenoms?.stuatom]?.value_locked || 0) +
          Number(totalValueLocked?.[ibcDenoms?.uatom]?.value_locked || 0) +
          Number(totalValueLocked?.[ibcDenoms?.uusdc]?.value_locked || 0)

        );
    }

    return `$${commaSeparator(Number(amount || 0).toFixed(ZERO_DOLLAR_DECIMALS))}
`;
  };

  useEffect(() => {
    fetchDashboardDollorTVL((error, result) => {
      if (error) {
        console.log(error, "TVL Api Error");
      }
      setTotalValueLocked(result?.data?.assets)
      setTotalDollarValue(result?.data?.total_value_locked)
    })

    fetchDashboardMintedCMSTTVL((error, result) => {
      if (error) {
        console.log(error, "TVL Api Error");
      }

      setTotalMintedCMST(amountConversion(result?.data?.total_minted || 0, comdex?.coinDecimals))
      setUniqueCMSTMintedData(result?.data?.assets)
    })
  }, [])

  const MintedCMSTOptions = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 210,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "110%",
        innerSize: "82%",
        borderWidth: 0,
        className: "totalvalue-chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    tooltip: {
      formatter: function () {
        return (
          '<div style="text-align:center; font-weight:800; ">' +
          commaSeparator(Number(this.y).toFixed(DOLLAR_DECIMALS)) +
          "<br />" +
          '<small style="font-size: 10px; font-weight:400;">' +
          this.key +
          "</small>" +
          "</div>"
        );
      },
      useHTML: true,
      backgroundColor: "#232231",
      borderColor: "#fff",
      borderRadius: 10,
      zIndex: 99,
      style: {
        color: "#fff",
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "AXL-USDC",
            y: Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc]?.minted_amount)),
            color: "#665AA6",
          },
          {
            name: "ATOM",
            y: Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom]?.minted_amount || 0, comdex?.coinDecimals)),
            color: "#BFA9D7",
          },
          {
            name: "STATOM",
            y: Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.stuatom]?.minted_amount || 0, comdex?.coinDecimals)),
            color: "#8e78a5",
          },
          {
            name: "Others",
            y: Number(totalMintedCMST || 0) -
              (Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.stuatom]?.minted_amount || 0, comdex?.coinDecimals)) +
                Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom]?.minted_amount || 0, comdex?.coinDecimals)) +
                Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc]?.minted_amount || 0, comdex?.coinDecimals))
              ),
            color: isDarkMode ? "#373549" : "#E0E0E0",
          },
        ],
      },
    ],
  };

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 210,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "110%",
        innerSize: "82%",
        borderWidth: 0,
        className: "totalvalue-chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    tooltip: {
      formatter: function () {
        return (
          '<div style="text-align:center; font-weight:800; ">' +
          commaSeparator(Number(this.y).toFixed(DOLLAR_DECIMALS)) +
          "<br />" +
          '<small style="font-size: 10px; font-weight:400;">' +
          this.key +
          "</small>" +
          "</div>"
        );
      },
      useHTML: true,
      backgroundColor: "#232231",
      borderColor: "#fff",
      borderRadius: 10,
      zIndex: 99,
      style: {
        color: "#fff",
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "AXL-USDC",
            y: Number(totalValueLocked?.[ibcDenoms?.uusdc]?.value_locked || 0),
            color: "#665AA6",
          },
          {
            name: "ATOM",
            y: Number(
              totalValueLocked?.[ibcDenoms?.uatom]?.value_locked || 0
            ),
            color: "#BFA9D7",
          },
          {
            name: "STATOM",
            y: Number(totalValueLocked?.[ibcDenoms?.stuatom]?.value_locked || 0),
            color: "#8e78a5",
          },
          {
            name: "Others",
            y:
              Number(totalDollarValue || 0) -
              (
                Number(totalValueLocked?.[ibcDenoms?.stuatom]?.value_locked || 0) +
                Number(totalValueLocked?.[ibcDenoms?.uatom]?.value_locked || 0) +
                Number(totalValueLocked?.[ibcDenoms?.uusdc]?.value_locked || 0)
              ),
            color: isDarkMode ? "#373549" : "#E0E0E0",
          },
        ],
      },
    ],
  };


  return (
    <div className="app-content-wrapper dashboard-app-content-wrapper">
      <Row>
        <Col className="dashboard-upper ">
          <div className="dashboard-upper-left ">
            <div
              className="composite-card  earn-deposite-card"
              style={{ height: "97%" }}
            >
              <div className="dashboard-statics">
                <p className="total-value">
                  Total Value Locked{" "}
                  <TooltipIcon
                    text={variables[lang].tooltip_total_value_locked}
                  />
                </p>
                <h2>
                  $
                  {commaSeparator(
                    Number(totalDollarValue || 0).toFixed(ZERO_DOLLAR_DECIMALS)
                  )}
                </h2>
              </div>
              <div className="totalvalues">
                <div className="totalvalues-chart">
                  <HighchartsReact highcharts={Highcharts} options={Options} />
                </div>
                <div className="totalvalues-right">
                  <div className="dashboard-statics mb-4  ">
                    <p>AXL-USDC</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(
                          totalValueLocked?.[ibcDenoms?.uusdc]?.value_locked || 0
                        ).toFixed(ZERO_DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>

                  <div className="dashboard-statics mb-4 total-dashboard-stats">
                    <p>ATOM</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(
                          totalValueLocked?.[ibcDenoms?.uatom]?.value_locked || 0
                        ).toFixed(ZERO_DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-4 total-dashboard-stats-2">
                    <p>STATOM</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(
                          totalValueLocked?.[ibcDenoms?.stuatom]?.value_locked || 0
                        ).toFixed(ZERO_DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-0 others-dashboard-stats">
                    <p>Others</p>
                    <h3>{calculateTotalValueLockedInDollarForOthers()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-upper-left dashboard-upper-right">
            <div
              className="composite-card  earn-deposite-card dashboard-chart-container"
              style={{ height: "97%" }}
            >
              <div className="dashboard-statics">
                <p className="total-value">
                  Total CMST Minted{" "}
                  <TooltipIcon
                    text={variables[lang].tooltip_total_value_minted}
                  />
                </p>
                <h2>

                  {commaSeparator(
                    Number(totalMintedCMST || 0).toFixed(ZERO_DOLLAR_DECIMALS)
                  )} CMST
                </h2>
              </div>
              <div className="totalvalues">
                <div className="totalvalues-chart">
                  <HighchartsReact highcharts={Highcharts} options={MintedCMSTOptions} />
                </div>
                <div className="totalvalues-right">

                  <div className="dashboard-statics mb-4 ">
                    <p>AXL-USDC</p>
                    <h3>
                      {commaSeparator(Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc]?.minted_amount || 0, comdex?.coinDecimals)).toFixed(ZERO_DOLLAR_DECIMALS))} CMST
                    </h3>
                  </div>

                  <div className="dashboard-statics mb-4 total-dashboard-stats">
                    <p>ATOM</p>
                    <h3>
                      {commaSeparator(Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom]?.minted_amount || 0, comdex?.coinDecimals)).toFixed(ZERO_DOLLAR_DECIMALS))} CMST
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-4 total-dashboard-stats-2">
                    <p>STATOM</p>
                    <h3>
                      {commaSeparator(Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.stuatom]?.minted_amount || 0, comdex?.coinDecimals)).toFixed(ZERO_DOLLAR_DECIMALS))} CMST
                    </h3>
                  </div>

                  <div className="dashboard-statics mb-0 others-dashboard-stats">
                    <p>Others</p>
                    <h3>{
                      commaSeparator(
                        Math.max(
                          Number(Number(totalMintedCMST || 0) -
                            (
                              Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.stuatom]?.minted_amount || 0, comdex?.coinDecimals)) +
                              Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom]?.minted_amount || 0, comdex?.coinDecimals)) +
                              Number(amountConversion(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc]?.minted_amount || 0, comdex?.coinDecimals))
                            )).toFixed(ZERO_DOLLAR_DECIMALS)
                          , 0))

                    } CMST
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Banner lang={lang} />
    </div>
  );
};

Dashboard.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  assetMap: PropTypes.object,
  markets: PropTypes.object,
  harborPrice: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    isDarkMode: state.theme.theme.darkThemeEnabled,
    markets: state.oracle.market,
    assetMap: state.asset.map,
    harborPrice: state.liquidity.harborPrice,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Dashboard);
