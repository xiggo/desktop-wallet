import { ipcRenderer } from "electron";

import { PluginRawInstance } from "@/plugins/types";

export const search = (profileId: string): Promise<PluginRawInstance[]> =>
	ipcRenderer.invoke("plugin:loader-fs.search", profileId);
export const remove = (directory: string): Promise<PluginRawInstance[]> =>
	ipcRenderer.invoke("plugin:loader-fs.remove", directory);
export const find = (directory: string): Promise<PluginRawInstance> =>
	ipcRenderer.invoke("plugin:loader-fs.find", directory);
