import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import CustomInput from "../../components/CustomInput";
import { useDispatch } from "react-redux";
import { setAmountIn } from "../../actions/asset";
import { setLockerDefaultSelectTab } from "../../actions/locker";
import { useSelector } from "react-redux";
import { toDecimals } from "../../utils/string";
import { calculateROI, decimalConversion } from "../../utils/number";
import { DOLLAR_DECIMALS } from "../../constants/common";
import CloseLocker from "./Close";

const Earn = ({
  collectorData,
  lockerDefaultSelectTab,
  setLockerDefaultSelectTab
}) => {
  const dispatch = useDispatch();
  const { TabPane } = Tabs;
  const [principal, setPrincipal] = useState();
  const [years, setYears] = useState(1);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [totalROI, setTotalROI] = useState();

  const isLockerExist = useSelector((state) => state.locker.isLockerExist);

  const tabItems =
    [
      { label: "Deposit", key: "1", children: <Deposit /> },
      { label: "Withdraw", key: "2", disabled: !isLockerExist, children: <Withdraw /> },
      { label: "Close", key: "3", disabled: !isLockerExist, children: < CloseLocker /> },
    ]

  const onChangePrincipal = (value) => {
    value = toDecimals(value).toString().trim();
    setPrincipal(value);
    checkCalculation(value);
  };

  const checkCalculation = (
    principal,
    yearsInput = years,
    monthsInput = months,
    daysInput = days
  ) => {
    // eslint-disable-next-line no-mixed-operators
    if (principal && interestRate && yearsInput || monthsInput || daysInput) {
      setTotalROI(
        calculateROI(
          principal,
          interestRate,
          yearsInput,
          monthsInput,
          daysInput
        )
      );
    }
    else {
      setTotalROI(
        calculateROI(
          0,
          0,
          0,
          0,
          0
        )
      );
    }
  };

  const onChangeYears = (value) => {
    value = toDecimals(value).toString().trim();
    if (Number(value) <= 10) {
      setYears(value);
      checkCalculation(principal, value);
    }
  };

  const onChangeMonths = (value) => {
    value = toDecimals(value).toString().trim();

    if (Number(value) <= 12) {
      setMonths(value);
      checkCalculation(principal, years, value);
    }
  };

  const onChangeDays = (value) => {
    value = toDecimals(value).toString().trim();
    if (Number(value) <= 30) {
      setDays(value);
      checkCalculation(principal, years, months, value);
    }
  };

  const callback = (key) => {
    dispatch(setAmountIn(0));
    setLockerDefaultSelectTab(key)
  };

  const getIntrestRate = () => {
    let interest = collectorData && collectorData[0]?.lockerSavingRate
      ? Number(
        decimalConversion(collectorData && collectorData[0]?.lockerSavingRate) * 100
      ).toFixed(DOLLAR_DECIMALS)
      : Number().toFixed(DOLLAR_DECIMALS)
    setInterestRate(interest)
    return interest;
  }
  useEffect(() => {
    getIntrestRate()
  }, [collectorData])

  return (
    <>
      <div className="app-content-wrapper">
        <Row className="earn-main-container">
          <Col>
            <Tabs
              type="card"
              activeKey={lockerDefaultSelectTab}
              onChange={callback}
              className="comdex-tabs farm-modal-tab earn-tabs"
              items={tabItems}
            />
          </Col>

          <Col>
            <div className={lockerDefaultSelectTab === "2" ? "earn-deposite-card calculator-main-container calculator-withdraw-height" : "earn-deposite-card calculator-main-container" }>
              <div className="calculator-title">Calculator</div>
              <div className="calculator-container">
                <div className="content-container">
                  <div className="left-container">Total Investment (CMST)</div>
                  <div className="right-container">
                    <div className="input-container">
                      <CustomInput
                        className=""
                        placeholder="0.00"
                        value={principal}
                        onChange={(event) =>
                          onChangePrincipal(event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="content-container time-content-container">
                  <div className="left-container">Time Period</div>
                  <div className="right-container">
                    <div className="input-container">
                      <div className="year-container">
                        <CustomInput
                          className=""
                          placeholder="0"
                          value={years}
                          onChange={(event) =>
                            onChangeYears(event.target.value)
                          }
                        />
                      </div>
                      <div className="month-container">
                        <CustomInput
                          className=""
                          placeholder="0"
                          value={months}
                          max={12}
                          onChange={(event) =>
                            onChangeMonths(event.target.value)
                          }
                        />
                      </div>
                      <div className="day-container">
                        <CustomInput
                          className=""
                          placeholder="0"
                          value={days}
                          max={31}
                          onChange={(event) => onChangeDays(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-container">
                  <div className="left-container">Expected Interest Rate</div>
                  <div className="right-container">{interestRate}%</div>
                </div>
                <div className="content-container">
                  <div className="left-container">Total Value</div>
                  <div className="right-container">{totalROI || 0} CMST</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};
Earn.propTypes = {
  lang: PropTypes.string.isRequired,
  collectorData: PropTypes.array.isRequired,
  lockerDefaultSelectTab: PropTypes.string
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    collectorData: state.locker.collectorData,
    lockerDefaultSelectTab: state.locker.lockerDefaultSelectTab
  };
};
const actionsToProps = {
  setLockerDefaultSelectTab,
};
export default connect(stateToProps, actionsToProps)(Earn);
