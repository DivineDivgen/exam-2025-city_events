// import { useState } from "react";
import PropTypes from 'prop-types';
import InfoElementas from './InfoElementas';

const Kontaktai = () => {
  return (
    <>
      <h3>Kontaktai</h3>
      <div>
        <img src="https://img.icons8.com/?size=100&id=CCDYqb5KK5vI&format=png&color=000000" />{" "}
        +370600000001
      </div>
      <div>
        <img src="https://img.icons8.com/?size=100&id=108813&format=png&color=000000" />
        <a href="mailto:vardenis@gmail.com">vardenis@gmail.com</a>
      </div>

      <div>
        <h5>Socialiniai tinklai</h5>
        <a href="https:youtube.com">
          <img src="https://img.icons8.com/?size=100&id=cs0F7pb81QnM&format=png&color=000000" />
        </a>
        <a href="https:youtube.com">
          <img src="https://img.icons8.com/?size=100&id=cs0F7pb81QnM&format=png&color=000000" />
        </a>
        <a href="https:youtube.com">
          <img src="https://img.icons8.com/?size=100&id=cs0F7pb81QnM&format=png&color=000000" />
        </a>
      </div>
    </>
  );
};

Kontaktai.propTypes = {};

export default Kontaktai;
