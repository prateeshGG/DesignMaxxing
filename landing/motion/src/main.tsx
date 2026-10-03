import { FluteProjectPreview } from "./flute/ProjectPreview";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")!).render(<FluteProjectPreview projectId="05091a6c-79c6-4136-a0f6-5e2f66433d07" enabled={import.meta.env.DEV}>{<App />}</FluteProjectPreview>);
