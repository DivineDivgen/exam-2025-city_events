import { useState } from "react";
import PropTypes from 'prop-types';
import InfoElementas from './InfoElementas';
import { Link, Outlet } from "react-router-dom";

const Darbai = ({darbai}) => {
  return (
    <>
      <h3>Darbų sąrašas</h3>
      <ul>      
        {darbai.map((darbas) => <li key={darbas.id}><Link to={`/darbai/${darbas.id}`} >{darbas.pavadinimas}</Link></li>)}
        <li key='20'><Link to={`/darbai/20`} >Neegzistuojantis darbas</Link></li>
      </ul>

      <Outlet />

    </>
  );
};

Darbai.propTypes = {
  darbai: PropTypes.array.isRequired,
};

export default Darbai;
