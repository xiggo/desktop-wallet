/* eslint-disable @typescript-eslint/require-await */
import fs from "fs";
import { act, renderHook } from "@testing-library/react-hooks";

import { ReadableFile } from "@/app/hooks/use-files";
import { useProfileImport } from "@/domains/profile/hooks/use-profile-import";
import { env } from "@/utils/testing-library";

let dwe: ReadableFile;
let passwordProtectedDwe: ReadableFile;
let json: ReadableFile;
let jsonCorrupted: ReadableFile;
let jsonEmpty: ReadableFile;

describe("useProfileImport", () => {
	beforeAll(() => {
		const jsonEmptyContent = fs.readFileSync("src/tests/fixtures/profile/import/d2_test_wallets-empty.json");
		const jsonContent = fs.readFileSync("src/tests/fixtures/profile/import/d2_test_wallets.json");
		const dweFileContents = fs.readFileSync("src/tests/fixtures/profile/import/profile.dwe");
		const passwordProtectedDweFileContents = fs.readFileSync(
			"src/tests/fixtures/profile/import/password-protected-profile.dwe",
		);

		dwe = { content: dweFileContents.toString(), extension: ".dwe", name: "profile.dwe" };
		passwordProtectedDwe = {
			content: passwordProtectedDweFileContents.toString(),
			extension: ".dwe",
			name: "export",
		};

		json = { content: jsonContent.toString(), extension: ".json", name: "export" };
		jsonCorrupted = { content: jsonContent.toString() + "...", extension: ".json", name: "export" };
		jsonEmpty = { content: jsonEmptyContent.toString(), extension: ".json", name: "export" };
	});

	it("should import profile from dwe", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({ file: dwe });

			expect(profile?.name()).toBe("test");
		});
	});

	it("should import password protected profile from dwe", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({
				file: passwordProtectedDwe,
				password: "S3cUrePa$sword",
			});

			expect(profile?.name()).toBe("test");
		});
	});

	it("should require password", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(result.current.importProfile({ file: passwordProtectedDwe })).rejects.toThrow(
				"PasswordRequired",
			);
		});
	});

	it("should throw for invalid password", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(
				result.current.importProfile({ file: passwordProtectedDwe, password: "test" }),
			).rejects.toThrow("InvalidPassword");
		});
	});

	it("should throw for unknown error in import", async () => {
		const mockProfileImport = jest.spyOn(env.profiles(), "import").mockImplementation(() => {
			throw new Error("some error");
		});
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(
				result.current.importProfile({ file: passwordProtectedDwe, password: "test" }),
			).rejects.toThrow("some error");
		});
		mockProfileImport.mockRestore();
	});

	it("should import from json file", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const profile = await result.current.importProfile({ file: json });

			expect(profile?.wallets().count()).toBe(2);
		});
	});

	it("should return undefined if file is not provided", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			//@ts-ignore
			const profile = await result.current.importProfile({});

			expect(profile).toBeUndefined();
		});
	});

	it("should throw if json has missing wallets", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(result.current.importProfile({ file: jsonEmpty })).rejects.toThrow("MissingWallets");
		});
	});

	it("should throw if json is corrupted", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			await expect(result.current.importProfile({ file: jsonCorrupted })).rejects.toThrow("CorruptedData");
		});
	});

	it("should ignore unknown file extension", async () => {
		const { result } = renderHook(() => useProfileImport({ env }));

		await act(async () => {
			const response = await result.current.importProfile({
				file: { content: "", extension: ".txs", name: "test" },
			});

			expect(response).toBeUndefined();
		});
	});
});
