import fs from "fs";
import os from "os";
import { renderHook } from "@testing-library/react-hooks";
import electron from "electron";

import { useFiles } from "./use-files";

describe("useFiles", () => {
	it("should read file contents", () => {
		const fsMock = jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from("test mnemonic"));

		const { result } = renderHook(() => useFiles());

		const { content, name, extension } = result.current.readFileContents("filePath");

		expect(extension).toBe("");
		expect(name).toBe("filePath");

		expect(content).toBeInstanceOf(Buffer);
		expect(content.toString()).toBe("test mnemonic");

		fsMock.mockRestore();
	});

	it("should open file", async () => {
		const fsMock = jest.spyOn(fs, "readFileSync").mockReturnValueOnce(Buffer.from("file"));

		// @ts-ignore
		const showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: ["filePath"],
		}));

		const { result } = renderHook(() => useFiles());

		await result.current.openFile({ extensions: ["json"] });

		expect(showOpenDialogMock).toHaveBeenCalledWith({
			defaultPath: os.homedir(),
			filters: [{ extensions: ["json"], name: "" }],
			properties: ["openFile"],
		});

		// @ts-ignore
		const showOpenDialogEmptyFilesMock = jest
			.spyOn(electron.remote.dialog, "showOpenDialog")
			.mockImplementation(() => ({ filePaths: [] } as any));

		await result.current.openFile({ extensions: ["json"] });

		expect(showOpenDialogMock).toHaveBeenCalledWith({
			defaultPath: os.homedir(),
			filters: [{ extensions: ["json"], name: "" }],
			properties: ["openFile"],
		});

		showOpenDialogMock.mockRestore();
		showOpenDialogEmptyFilesMock.mockRestore();
		fsMock.mockRestore();
	});
});
