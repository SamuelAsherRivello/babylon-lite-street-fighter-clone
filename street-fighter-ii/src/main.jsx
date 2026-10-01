import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FightGame } from "./game/FightGame.jsx";
import { App } from "./ui/App.jsx";
import "./ui/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App content={<FightGame />} />
  </StrictMode>,
);
