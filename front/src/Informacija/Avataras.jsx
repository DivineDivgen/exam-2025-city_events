import { useState } from "react";
// import PropTypes from 'prop-types';


const Avataras = () => {
  const [img, setImg] = useState("/avatar.png");

  return (
    <div><img src={img} /></div>
  );
};

Avataras.propTypes = {
};

export default Avataras;