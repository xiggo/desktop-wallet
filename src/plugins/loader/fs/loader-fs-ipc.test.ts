import { ipcRenderer } from "electron";
import * as ipcFunctions from "plugins/loader/fs/loader-fs-ipc";

describe("loader-fs-ipc", () => {
	let ipcRendererInvoke: jest.SpyInstance;

	beforeEach(() => {
		ipcRendererInvoke = jest.spyOn(ipcRenderer, "invoke").mockImplementation();
	});

	afterEach(() => {
		ipcRendererInvoke.mockRestore();
	});

	it.each(["search", "remove", "find"])("calls ipcRenderer.invoke", async (name: string) => {
		await (ipcFunctions as any)[name]("param");

		expect(ipcRendererInvoke).toHaveBeenCalledWith(`plugin:loader-fs.${name}`, "param");
	});
});
