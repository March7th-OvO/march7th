import { createContext, useContext } from "react";
import { initialScrollyConfig } from "../../config/scrollyConfig";
export const ScrollyConfigContext = createContext(initialScrollyConfig);
export const useScrollyConfig = () => useContext(ScrollyConfigContext);
