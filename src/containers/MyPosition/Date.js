import { useEffect, useState } from "react";
import { getTransactionTimeFromHeight } from "../../services/transaction";
import moment from "moment";

const Date = ({ height }) => {
  const [timestamp, setTimestamp] = useState();

  useEffect(() => {
    if (height) {
      fetchData();
    }
  }, [height]);

  const fetchData = async () => {
    const trasactionTime = await getTransactionTimeFromHeight(height);
    if (trasactionTime) {
      setTimestamp(trasactionTime);
    }
  };

  return (
    <div className="dates-col" style={{ width: "240px" }}>
      <div className="dates">
        {moment(timestamp).format("MMM DD, YYYY HH:mm")}
      </div>
    </div>
  );
};

export default Date;
