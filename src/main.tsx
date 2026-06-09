import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

const shellLoader = document.getElementById("app-shell-loader");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

requestAnimationFrame(() => {
  shellLoader?.classList.add("is-hidden");
  window.setTimeout(() => shellLoader?.remove(), 260);
});
