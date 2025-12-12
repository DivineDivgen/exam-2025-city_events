import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "@material-tailwind/react";
import "./index.css";

const el = document.getElementById("root");
if (!el) throw new Error('Missing <div id="root"></div> in index.html');

ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
