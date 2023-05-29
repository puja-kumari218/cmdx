import { Button } from "antd";
import * as PropTypes from "prop-types";
import { Link } from "react-router-dom";

const Banner = ({ lang }) => {
  return (
    <div className="dashboard-banner earn-deposite-card">
      <div className="banner-left">
        <h2>
          Borrow <span>Composite</span>  by depositing <br /> your IBC assets
        </h2>
        <Link to='/mint'>
          <Button type="primary " className=" btn-filled ">
            Take me there!
          </Button>
        </Link>
      </div>
    </div>
  );
};

Banner.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default Banner;
