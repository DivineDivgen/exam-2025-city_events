// import { useState } from "react";
// import PropTypes from 'prop-types';

import Avataras from "./Avataras";
// import InfoApie from "./InfoApie";
// import Kontaktai from "./Kontaktai";
import { Link, Outlet } from "react-router-dom";

const Informacija = () => {
  return (
    <header>
      <h1>Vardenis Pavardenis</h1>

      <Avataras></Avataras>

      <ul>
        <li>
          <Link to="/apie">Apie mane</Link>
        </li>
        <li>
          <Link to="/kontaktai">Kontaktai</Link>
        </li>
        <li>
          <Link to="/darbai">Darbų sąrašas</Link>
        </li>
      </ul>

      {/* <InfoApie pavadinimas="Apie mane" sarasas={infoSarasas}></InfoApie>
      <Kontaktai></Kontaktai> */}

      <Outlet />
      
    </header>
  );
};

Informacija.propTypes = {};

export default Informacija;
