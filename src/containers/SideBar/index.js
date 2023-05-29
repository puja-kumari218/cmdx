import * as PropTypes from "prop-types";
import "./index.scss";
import { Layout } from "antd";
import { SvgIcon } from "../../components/common";
import { useMediaQuery } from "react-responsive";
import Footer from "../Footer";
import React, { useState } from "react";
import Tabs from "./Tabs";
import { Scrollbars } from "react-custom-scrollbars";
import { useNavigate } from "react-router";
import { connect } from "react-redux";

const { Sider } = Layout;

const SideBar = ({ lang, isDarkMode }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(!!isMobile);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (isOpen && isMobile) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  };

  return (
    <>
      <Layout
        className={isOpen ? "sidebar-wrapper" : "sidebar-open sidebar-wrapper"}
      >
        <button
          className="sidebar-toggle"
          title="sidebar-toggle"
          onClick={toggle}
        >
          {isMobile ? (
            <SvgIcon
              className={isOpen ? "open" : ""}
              name={isOpen ? "sidebar-menu" : "sidebar-close"}
            />
          ) : (
            <SvgIcon
              className={isOpen ? "open" : ""}
              name={isOpen ? "sidebar-open" : "sidebar-close"}
            />
          )}
        </button>
        <Sider
          collapsible
          breakpoint="lg"
          collapsed={isOpen}
          collapsedWidth="0"
          trigger={null}
        >
          <div className="side_bar">
            <div
              className="logo"
              onClick={() =>
                navigate({
                  pathname: "/",
                })
              }
            >
              {isDarkMode ? (
                <SvgIcon name="harbor-logo" />
              ) : (
                <SvgIcon name="harbor-logo-light" />
              )}
            </div>
            <Scrollbars>
              <div className="side_bar_inner">
                <Tabs onClick={toggle} />
              </div>
            </Scrollbars>
            <Footer />
          </div>
        </Sider>
      </Layout>
      <div onClick={toggle}>
        {isMobile && !isOpen && <div className="sidebar-overlay" />}
      </div>
    </>
  );
};
SideBar.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,

  // lang: PropTypes.string.isRequired,
};
const stateToProps = (state) => {
  return {
    // lang: state.language,
    isDarkMode: state.theme.theme.darkThemeEnabled,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(SideBar);
