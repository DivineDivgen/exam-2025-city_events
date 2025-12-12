// import { useState } from "react";
import PropTypes from 'prop-types';


const InfoElementas = ({item}) => {
  return (
    <li><b>{item.pavadinimas}:</b> {item.reiksme}</li>
  );
};

InfoElementas.propTypes = {
  item: PropTypes.object.isRequired,
};

export default InfoElementas;