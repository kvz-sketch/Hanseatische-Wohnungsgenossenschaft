import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./grow.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Portal } from "./pages/Portal";
import { Impressum } from "./pages/Impressum";
import { Datenschutz } from "./pages/Datenschutz";

const pages: Record<string, () => ReactNode> = {
  home: Home,
  portal: Portal,
  impressum: Impressum,
  datenschutz: Datenschutz,
};

const Page = pages[document.body.dataset.page ?? "home"] ?? Home;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div id="top">
      <Header />
      <main>
        <Page />
      </main>
      <Footer />
    </div>
  </StrictMode>,
);
