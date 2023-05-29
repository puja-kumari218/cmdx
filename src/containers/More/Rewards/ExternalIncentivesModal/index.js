import React, { useState } from 'react'
import { Col, Row, SvgIcon } from "../../../../components/common";
import { Modal, Table, Button } from "antd";
import './index.scss'

const ExternalIncentivesModal = ({ }) => {

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

  const emissionDistributionColumns = [
    {
      title: '',
      dataIndex: "assets",
      key: "assets",
      align: 'left',
      render: (text) => <>
        <div className="assets-withicon">
          <div className="assets-icons">
            <div className="assets-icon">
              <SvgIcon
                name='cmdx-icon'
              />
            </div>
          </div>
          <div className='name'>{text}</div>
        </div>
      </>
    },
  ];

  const emissionDistributionData = [
    {
      key: 1,
      assets: '123.45 CMDX',
    },
    {
      key: 2,
      assets: '23.56 HARBOR',
    },
    {
      key: 3,
      assets: '1345.67 ATOM',
    }
  ];


  return (
    <>
      <Button size='small' type='primary' className='ml-3' onClick={showModal}>View All</Button>
      <Modal
        centered={true}
        className="emission-modal external-incentives-mdoal"
        footer={null}
        header={null}
        title='External Incentives'
        open={isModalOpen}
        width={450}
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
                  <Table
                    className="custom-table emission-distribution-table"
                    dataSource={emissionDistributionData}
                    columns={emissionDistributionColumns}
                    pagination={false}
                    scroll={{ x: "100%" }}
                    showHeader={false}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  )
}

export default ExternalIncentivesModal;