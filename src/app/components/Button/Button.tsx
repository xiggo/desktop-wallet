import { withThemeDecorator } from "plugins";

import { pluginManager } from "@/app/PluginProviders";

import { OriginalButton } from "./OriginalButton";

// Expose button to be overriden by plugins
export const Button = withThemeDecorator("button", OriginalButton, pluginManager);
