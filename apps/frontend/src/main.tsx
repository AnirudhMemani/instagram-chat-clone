import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { RecoilRoot } from "recoil";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <RecoilRoot>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <Toaster richColors />
      </BrowserRouter>
    </ThemeProvider>
  </RecoilRoot>
  // </React.StrictMode>
);
