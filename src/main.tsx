import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

const shellLoader = document.getElementById("app-shell-loader");
const startTime = Date.now();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

const elapsed = Date.now() - startTime;
const minSplashMs = 2000;
const delay = Math.max(0, minSplashMs - elapsed);

requestAnimationFrame(() => {
  setTimeout(() => {
    shellLoader?.classList.add("is-hidden");
    setTimeout(() => shellLoader?.remove(), 260);
  }, delay);
});
