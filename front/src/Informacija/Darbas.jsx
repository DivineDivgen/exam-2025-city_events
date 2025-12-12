import { useState } from "react";
import PropTypes from "prop-types";
import InfoElementas from "./InfoElementas";
import { Link, Outlet, useLoaderData, useParams } from "react-router-dom";

const Darbas = () => {
  const darbas = useLoaderData();
  // console.log(darbas);

  return (
    <>
      <h3>{darbas.pavadinimas}</h3>
      <h5>Įgudžiai</h5>
      <p>{darbas.igudziai}</p>
    </>
  );
};

Darbas.propTypes = {};

export default Darbas;
