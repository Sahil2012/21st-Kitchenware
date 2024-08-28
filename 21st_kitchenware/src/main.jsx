import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";

function Main() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <NextUIProvider>
      <div className={isDarkMode ? "dark text-foreground bg-background" : "text-foreground bg-background"}>
        <App isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>
    </NextUIProvider>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
