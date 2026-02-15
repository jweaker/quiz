import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css";
import App from "./App";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: "easeOut" }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  </React.StrictMode>
);
