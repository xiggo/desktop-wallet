/* istanbul ignore file */

import { ipcMain } from "electron";
import os from "os";
import path from "path";

import { PluginLoaderFileSystem } from "./loader-fs";

export const injectHandler = () => {
	const root = process.env.PLUGINS_DIR || path.resolve(os.homedir(), ".payvo-wallet", "plugins");

	const finder = new PluginLoaderFileSystem(root);

	ipcMain.handle("plugin:loader-fs.search", (_, profileId: string) => finder.search(profileId));
	ipcMain.handle("plugin:loader-fs.remove", (_, dir: string) => finder.remove(dir));
	ipcMain.handle("plugin:loader-fs.find", (_, dir: string) => finder.find(dir));
};
