import { Contracts } from "@payvo/profiles";
import { renderHook } from "@testing-library/react-hooks";

import { useLedgerModelStatus } from "./use-ledger-model-status";

describe("useLedgerModelStatus", () => {
	describe("#isLedgerModelSupported", () => {
		it("should return false if ledger model is not provided", () => {
			const { result } = renderHook(() =>
				useLedgerModelStatus({
					connectedModel: undefined,
					supportedModels: [Contracts.WalletLedgerModel.NanoS, Contracts.WalletLedgerModel.NanoX],
				}),
			);

			expect(result.current.isLedgerModelSupported).toEqual(false);
		});

		it("should support NanoS", () => {
			const { result } = renderHook(() =>
				useLedgerModelStatus({ connectedModel: Contracts.WalletLedgerModel.NanoS }),
			);

			expect(result.current.isLedgerModelSupported).toEqual(true);
		});

		it("should support NanoX", () => {
			const { result } = renderHook(() =>
				useLedgerModelStatus({ connectedModel: Contracts.WalletLedgerModel.NanoX }),
			);

			expect(result.current.isLedgerModelSupported).toEqual(true);
		});

		it("should support only NanoX", () => {
			const { result } = renderHook(() =>
				useLedgerModelStatus({
					connectedModel: Contracts.WalletLedgerModel.NanoX,
					supportedModels: [Contracts.WalletLedgerModel.NanoX],
				}),
			);

			expect(result.current.isLedgerModelSupported).toEqual(true);
		});

		it("should support only NanoS", () => {
			const { result } = renderHook(() =>
				useLedgerModelStatus({
					connectedModel: Contracts.WalletLedgerModel.NanoS,
					supportedModels: [Contracts.WalletLedgerModel.NanoS],
				}),
			);

			expect(result.current.isLedgerModelSupported).toEqual(true);
		});

		it("should return false if supported and connected models don't match", () => {
			const { result } = renderHook(() =>
				useLedgerModelStatus({
					connectedModel: Contracts.WalletLedgerModel.NanoX,
					supportedModels: [Contracts.WalletLedgerModel.NanoS],
				}),
			);

			expect(result.current.isLedgerModelSupported).toEqual(false);
		});
	});
});
