import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Navbar  from "./Navbar.jsx";
import { ThemeProvider } from "@material-tailwind/react";
import "./index.css";

const el = document.getElementById("root");
if (!el) throw new Error('Missing <div id="root"></div> in index.html');

ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <ThemeProvider>
      <Navbar />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
