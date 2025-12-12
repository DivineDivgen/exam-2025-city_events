// import { useState } from "react";
import PropTypes from 'prop-types';
import InfoElementas from './InfoElementas';

const InfoApie = ({pavadinimas, sarasas}) => {
  return (
    <>
      <h3>{pavadinimas}</h3>
      <ul>
        {sarasas.map((item, index) => <InfoElementas key={index} item={item} />)}
      </ul>
    </>
  );
};

InfoApie.propTypes = {
  pavadinimas: PropTypes.string.isRequired,
  sarasas: PropTypes.array.isRequired,
};

export default InfoApie;
