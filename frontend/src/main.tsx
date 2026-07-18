import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import eruda from "eruda";

if (import.meta.env.DEV || window.location.hostname.includes("vercel.app")) {
  eruda.init();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
