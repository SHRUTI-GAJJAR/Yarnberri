import React from "react";
import ReactDOM from "react-dom/client";
// Bootstrap and Tailwind are layered inside styles/vendor.css so Tailwind
// can win the class names they share. globals.css and crochet.css stay
// unlayered, which puts the whole yb-* brand layer above every vendor.
import "./styles/vendor.css";
import "./styles/globals.css";
import "./styles/crochet.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);