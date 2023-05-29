import "./index.scss";
import React from "react";
import { SvgIcon } from "../../components/common";
import { HOSTED_ON_TEXT } from "../../constants/common";

const Footer = () => {


  return (
    <div className="footer">
      {HOSTED_ON_TEXT ? (
        <div className="footer-text">{HOSTED_ON_TEXT}</div>
      ) : null}
      <div className="social-icons">
        <a
          aria-label="Discord"
          target="_blank"
          rel="noreferrer"
          href="https://bit.ly/ComdexOfficialDiscord"
        >
          <SvgIcon name={localStorage.getItem("isDarkMode") === "false"
            ? "discord-light"
            : "discord"} viewbox="0 0 29.539 22.155" />
        </a>
        <a
          aria-label="Telegram"
          target="_blank"
          rel="noreferrer"
          href="https://t.me/Composite_Money"
        >
          <SvgIcon name={localStorage.getItem("isDarkMode") === "false"
            ? "telegram-light"
            : "telegram"} viewbox="0 0 24.635 20.66" />
        </a>
        <a
          aria-label="Twitter"
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/Harbor_Protocol"
        >
          <SvgIcon name={localStorage.getItem("isDarkMode") === "false"
            ? "twitter-light"
            : "twitter"} viewbox="0 0 25.617 20.825" />
        </a>
        <a
          aria-label="Medium"
          target="_blank"
          rel="noreferrer"
          href="https://medium.com/@Harbor_Protocol"
        >
          <SvgIcon name={localStorage.getItem("isDarkMode") === "false"
            ? "medium-light"
            : "medium"} viewbox="0 0 25.825 20.66" />
        </a>

        <a
          aria-label="Github"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/comdex-official"
        >
          <SvgIcon name={localStorage.getItem("isDarkMode") === "false"
            ? "github-light"
            : "github"} viewbox="0 0 25.825 20.66" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
