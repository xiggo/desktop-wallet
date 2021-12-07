import { withThemeDecorator } from "plugins";

import { OriginalButton } from "./OriginalButton";
import { pluginManager } from "@/app/PluginProviders";

// Expose button to be overriden by plugins
export const Button = withThemeDecorator("button", OriginalButton, pluginManager);
