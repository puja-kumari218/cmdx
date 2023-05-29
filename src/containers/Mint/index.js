import "./index.scss";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import React from "react";
import { setAccountVaults } from "../../actions/account";
import Minting from "./minting";

const Borrow = () => {

  return (
    <div className="app-content-wrapper">
      <Minting />
    </div>
  );
};

Borrow.propTypes = {
  setAccountVaults: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  pairs: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
        liquidationRatio: PropTypes.string,
        id: PropTypes.shape({
          high: PropTypes.number,
          low: PropTypes.number,
          unsigned: PropTypes.bool,
        }),
      })
    ),
  }),
  vault: PropTypes.shape({
    collateral: PropTypes.shape({
      denom: PropTypes.string,
    }),
    debt: PropTypes.shape({
      denom: PropTypes.string,
    }),
    id: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    vault: state.account.vault,
  };
};

const actionToProps = {
  setAccountVaults,
};

export default connect(stateToProps, actionToProps)(Borrow);
