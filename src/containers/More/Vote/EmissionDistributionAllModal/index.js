import React, { useEffect, useState } from 'react'
import { Col, Row, SvgIcon } from "../../../../components/common";
import { Modal, Table } from "antd";
import { denomToSymbol, iconNameFromDenom } from "../../../../utils/string";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { combineColor, poolColor, vaultColor } from '../color';
import './index.scss'
import { amountConversion } from '../../../../utils/coin';
import { votingCurrentProposal } from '../../../../services/voteContractsRead';
import { DOLLAR_DECIMALS } from '../../../../constants/common';

const EmissionDistributionAllModal = ({ userCurrentProposalData, currentProposalAllData }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [concatedExtendedPair, setConcatedExtendedPair] = useState([]);
  const [concatedPairName, setConcatedPairName] = useState([]);
  const [topProposalData, setTopProposalData] = useState()

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function getColor(index) {
    const length = combineColor.length;
    const wrappedIndex = index % length;
    return combineColor[wrappedIndex];
  }

  const calculateTotalVotes = (value) => {
    let userTotalVotes = 0;
    let calculatePercentage = 0;

    calculatePercentage = (Number(value) / Number(amountConversion(currentProposalAllData?.total_voted_weight || 0, DOLLAR_DECIMALS))) * 100;
    calculatePercentage = Number(calculatePercentage || 0).toFixed(DOLLAR_DECIMALS)
    if (calculatePercentage === "Infinity") {
      return 0
    } else {
      return calculatePercentage;
    }
  }

  useEffect(() => {
    if (userCurrentProposalData) {
      let filteredData = [...userCurrentProposalData];
      filteredData.sort((a, b) => calculateTotalVotes(amountConversion(b?.total_vote || 0, 6) || 0) - calculateTotalVotes(amountConversion(a?.total_vote || 0, 6) || 0));
      setTopProposalData(filteredData)
    }

  }, [userCurrentProposalData, currentProposalAllData])



  const PieChart1 = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 170,
      margin: 0,
      style: {
        fontFamily: 'Montserrat'
      }
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
        borderWidth: 0,
        innerSize: "78%",
        className: "pie-chart totalvalue-chart",
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
          Number(calculateTotalVotes(amountConversion(Number(this.y) || 0, 6) || 0)) + "%" +
          "<br />" +
          '<small style="font-size: 10px; font-weight:400;">' +
          this.point.name +
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
            enabled: true,
          },
        },
        name: "",
        data: userCurrentProposalData && userCurrentProposalData?.map((item, index) => {
          return ({
            name: item?.pair_name === "" ? `${denomToSymbol(item?.base_coin)}/${denomToSymbol(item?.quote_coin)} ` : item?.pair_name,
            y: Number(item?.total_vote),
            color: getColor(index),
          })

        })
      },
    ],
  };

  const emissionDistributionColumns = [
    {
      title: '',
      dataIndex: "assets_color",
      key: "assets_color",
      width: 30
    },
    {
      title: 'Vaults/Pools',
      dataIndex: "assets",
      key: "assets",
      align: 'left',
    },
    {
      title: 'Vote',
      dataIndex: "vote",
      key: "vote",
    }
  ];

  const emissionDistributionData = topProposalData && topProposalData?.map((item, index) => {

    return {
      key: item?.pair_id,
      assets_color: <div className='colorbox' style={{ backgroundColor: `${getColor(index)}` }}></div>,
      assets: <div className="assets-withicon">
        <div className="assets-icons">
          <div className="assets-icon">
            <SvgIcon
              name={iconNameFromDenom(item?.base_coin)}
            />
          </div>

          {item?.pair_name === "" && <div className="assets-icon">
            <SvgIcon
              name={iconNameFromDenom(item?.quote_coin)}
            />
          </div>}
        </div>
        <div className='name'>{item?.pair_name === "" ? `${denomToSymbol(item?.base_coin)}/${denomToSymbol(item?.quote_coin)} ` : item?.pair_name}</div>
      </div>,
      vote: `${item?.total_vote ? calculateTotalVotes(amountConversion(item?.total_vote || 0, 6) || 0) : Number(0).toFixed(DOLLAR_DECIMALS)} %`,
    }

  })


  return (
    <>
      <div className="right" onClick={showModal}>
        View All
      </div>
      <Modal
        centered={true}
        className="emission-modal"
        footer={null}
        header={null}
        title='Vaults & Pools'
        open={isModalOpen}
        width={650}
        closable={true}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={<SvgIcon name='close' viewbox='0 0 19 19' />}
      >
        <div className="palcebid-modal-inner emission-modal-container">
          <Row>
            <Col>
              <div className="emission-card">
                <div className="graph-container">
                  <Row>
                    <Col sm='6'>
                      <div className="graph-container">
                        <HighchartsReact highcharts={Highcharts} options={PieChart1} />
                      </div>
                    </Col>
                    <Col sm='6'>
                      <div className="asset-container emission-distribution-modal-asset-container">
                        <div className="composite-card ">
                          <div className="card-content">
                            <Table
                              className="custom-table emission-distribution-table"
                              dataSource={emissionDistributionData}
                              columns={emissionDistributionColumns}
                              pagination={false}
                              scroll={{ x: "100%" }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

            </Col>
          </Row>
        </div>
      </Modal>
    </>
  )
}

export default EmissionDistributionAllModal;