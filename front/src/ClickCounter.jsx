// import { useState } from "react";
import PropTypes from 'prop-types';

const ClickCounter = ({count, setCount}) => {
  // const [count, setCount] = useState(1);

  return (
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/App.jsx</code> and save to test HMR
      </p>
    </div>
  );
};

ClickCounter.propTypes = {
  count: PropTypes.number.isRequired,
  setCount: PropTypes.func.isRequired,
};

export default ClickCounter;