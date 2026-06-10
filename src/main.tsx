function sanitizeUrl(msg: string): string {
  return msg.replace(/https?:\/\/[^\s"'>)\]},;:]+/g, "[URL]");
}

function sanitizeArgs(args: unknown[]): unknown[] {
  return args.map((a) => {
    if (typeof a === "string") return sanitizeUrl(a);
    if (a instanceof Error) {
      const err = a;
      try {
        return new Error(sanitizeUrl(err.message));
      } catch {
        return a;
      }
    }
    return a;
  });
}

if (import.meta.env.PROD) {
  const noop = () => {};
  console.debug = noop;
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  const origError = console.error;
  console.error = (...args) => origError(...sanitizeArgs(args));
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
