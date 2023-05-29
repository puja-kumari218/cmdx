import './index.scss';

const NoData = ({ text }) => {
    return (
        <div className="no_data">{text ? text : "Sorry, no data found"}</div>
    )
}

export default NoData;