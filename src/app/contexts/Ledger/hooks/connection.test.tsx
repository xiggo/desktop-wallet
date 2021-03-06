import { Observer } from "@ledgerhq/hw-transport";
import { LSK } from "@payvo/sdk-lsk";
import { Contracts } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { useTranslation } from "react-i18next";

import { useLedgerConnection } from "./connection";
import { minVersionList } from "@/app/contexts/Ledger/Ledger.contracts";
import { toasts } from "@/app/services";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	act,
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

const transport = getDefaultLedgerTransport();

const LedgerWaitingDevice = "Waiting Device";

describe("Use Ledger Connection", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let publicKeyPaths: Map<string, string>;
	let getVersionSpy: jest.SpyInstance;

	beforeAll(() => {
		publicKeyPaths = new Map<string, string>();
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		getVersionSpy = jest
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);

		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		getVersionSpy.mockRestore();
	});

	it("should listen for device", async () => {
		const Component = () => {
			const { hasDeviceAvailable, error } = useLedgerConnection(transport);
			return (
				<div>
					{error && <span>{error}</span>}
					<span>{hasDeviceAvailable ? "On" : "Off"}</span>
				</div>
			);
		};

		const unsubscribe = jest.fn();
		let observer: Observer<any>;

		const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});

		render(<Component />);

		act(() => {
			observer!.next({ descriptor: "", type: "add" });
		});

		await expect(screen.findByText("On")).resolves.toBeVisible();

		act(() => {
			observer!.next({ descriptor: "", type: "remove" });
		});

		await expect(screen.findByText("Off")).resolves.toBeVisible();

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoX" }, type: "add" });
		});

		await expect(screen.findByText("On")).resolves.toBeVisible();

		act(() => {
			observer.error(new Error("Test Error"));
			observer.complete();
		});

		await expect(screen.findByText("Test Error")).resolves.toBeVisible();

		listenSpy.mockReset();
	});

	it("should import ledger wallets", async () => {
		const Component = () => {
			const { importLedgerWallets } = useLedgerConnection(transport);
			const wallets = profile.wallets().values();

			const handleImport = async () => {
				const wallets = [{ address: "DQx1w8KE7nEW1nX9gj9iWjMXnp8Q3xyn3y", path: "m/44'/1'/0'/0/0" }];
				await importLedgerWallets(wallets, wallet.coin(), profile);
			};

			return (
				<div>
					<ul>
						{wallets.map((wallet) => (
							<li key={wallet.id()} data-testid="Wallet">
								{`${wallet.address()}-${wallet.isLedger() ? "Ledger" : "Standard"}`}
							</li>
						))}
					</ul>
					<button onClick={handleImport}>Import</button>
				</div>
			);
		};

		const unsubscribe = jest.fn();
		let observer: Observer<any>;

		const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});

		render(<Component />);

		await waitFor(() => {
			expect(screen.getAllByTestId("Wallet")).toHaveLength(2);
		});

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoX" }, type: "add" });
		});

		listenSpy.mockReset();

		userEvent.click(screen.getByText("Import"));

		await waitFor(() => {
			expect(screen.getAllByTestId("Wallet")).toHaveLength(2);
		});

		const importedWallet = profile
			.wallets()
			.findByAddressWithNetwork("DQx1w8KE7nEW1nX9gj9iWjMXnp8Q3xyn3y", "ark.devnet");

		expect(importedWallet?.isLedgerNanoX()).toBe(true);
		expect(importedWallet?.data().get(Contracts.WalletData.LedgerModel)).toBe(Contracts.WalletLedgerModel.NanoX);

		profile.wallets().forget("DQx1w8KE7nEW1nX9gj9iWjMXnp8Q3xyn3y");
		env.persist();
	});

	describe("Ledger Connection", () => {
		beforeEach(() => {
			jest.spyOn(wallet.coin(), "__construct").mockImplementation();
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		const Component = ({
			userProfile = profile,
			userWallet = wallet,
			retries = 3,
		}: {
			userProfile?: Contracts.IProfile;
			userWallet?: Contracts.IReadWriteWallet;
			retries?: number;
		}) => {
			const { connect, isConnected, isAwaitingConnection, error, abortConnectionRetry, disconnect } =
				useLedgerConnection(transport);
			const handleConnect = async () => {
				try {
					await connect(userProfile, userWallet.coinId(), userWallet.networkId(), {
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries,
					});
				} catch {
					//
				}
			};

			return (
				<div>
					{error && <span>{error}</span>}
					{isAwaitingConnection && <span>Waiting Device</span>}
					{isConnected && <span>Connected</span>}

					<button onClick={abortConnectionRetry}>Abort</button>
					<button onClick={handleConnect}>Connect</button>
					<button onClick={() => disconnect(userWallet.coin())}>Disconnect</button>
				</div>
			);
		};

		it("should succeed in connecting without retries", async () => {
			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			render(<Component />);

			userEvent.click(screen.getByText("Connect"));

			expect(screen.getByText(LedgerWaitingDevice)).toBeInTheDocument();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			getPublicKeySpy.mockReset();
		});

		it("should disconnect", async () => {
			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			render(<Component />);

			userEvent.click(screen.getByText("Connect"));

			expect(screen.getByText(LedgerWaitingDevice)).toBeInTheDocument();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			userEvent.click(screen.getByText("Disconnect"));

			await waitFor(() => expect(screen.queryByText("Connected")).not.toBeInTheDocument());

			getPublicKeySpy.mockReset();
		});

		it("should abort connection retries", async () => {
			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockRejectedValue(new Error("Failed"));

			render(<Component retries={50} />);

			userEvent.click(screen.getByText("Connect"));
			userEvent.click(screen.getByText("Abort"));

			await expect(
				screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR),
			).resolves.toBeVisible();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await waitFor(() => expect(getPublicKeySpy).toHaveBeenCalledTimes(3));

			getPublicKeySpy.mockReset();
		});

		it("should fail to connect with retries", async () => {
			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockRejectedValue({ message: "Failed", statusText: "UNKNOWN_ERROR" });

			render(<Component />);

			expect(screen.getByText("Connect")).toBeInTheDocument();

			userEvent.click(screen.getByText("Connect"));

			expect(screen.getByText(LedgerWaitingDevice)).toBeInTheDocument();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument(), {
				timeout: 4000,
			});

			await expect(
				screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR),
			).resolves.toBeVisible();

			await waitFor(() => expect(getPublicKeySpy).toHaveBeenCalledTimes(3));

			getPublicKeySpy.mockReset();
		});

		it("should fail to connect if app version is less than minimum version", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const outdatedVersion = "1.0.1";
			const getVersionSpy = jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue(outdatedVersion);

			render(<Component />);

			expect(screen.getByText("Connect")).toBeInTheDocument();

			userEvent.click(screen.getByText("Connect"));

			expect(screen.getByText(LedgerWaitingDevice)).toBeInTheDocument();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(
				screen.findByText(
					t("WALLETS.MODAL_LEDGER_WALLET.UPDATE_ERROR", {
						coin: wallet.network().coin(),
						version: outdatedVersion,
					}),
				),
			).resolves.toBeVisible();

			getPublicKeySpy.mockReset();
			getVersionSpy.mockReset();
		});

		it("should ignore the app version check for coins that are not in the minVersionList", async () => {
			nock.disableNetConnect();

			env.registerCoin("LSK", LSK);

			const profile = env.profiles().create("empty");

			const { wallet } = await profile.walletFactory().generate({
				coin: "LSK",
				network: "lsk.testnet",
			});
			await env.wallets().syncByProfile(profile);

			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			render(<Component userProfile={profile} userWallet={wallet} />);

			userEvent.click(screen.getByText("Connect"));

			expect(screen.getByText(LedgerWaitingDevice)).toBeInTheDocument();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			getPublicKeySpy.mockRestore();
		});
	});

	describe("Ledger Connection with options by default", () => {
		const Component = () => {
			const { connect, isConnected, isAwaitingConnection, error, abortConnectionRetry, disconnect } =
				useLedgerConnection(transport);
			const handleConnect = async () => {
				try {
					await connect(profile, wallet.coinId(), wallet.networkId());
				} catch {
					//
				}
			};

			return (
				<div>
					{error && <span>{error}</span>}
					{isAwaitingConnection && <span>Waiting Device</span>}
					{isConnected && <span>Connected</span>}

					<button onClick={abortConnectionRetry}>Abort</button>
					<button onClick={handleConnect}>Connect</button>
					<button onClick={() => disconnect(wallet.coin())}>Disconnect</button>
				</div>
			);
		};

		it("should succeed in connecting with options by default", async () => {
			let toastSpy: jest.SpyInstance;

			const getPublicKeySpy = jest
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const unsubscribe = jest.fn();
			let observer: Observer<any>;

			const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce((obv) => {
				observer = obv;
				return { unsubscribe };
			});

			render(<Component />);

			act(() => {
				observer!.next({ descriptor: "", deviceModel: { productName: "Nano S" }, type: "add" });
			});

			toastSpy = jest.spyOn(toasts, "success").mockImplementationOnce();
			userEvent.click(screen.getByText("Connect"));

			expect(screen.getByText(LedgerWaitingDevice)).toBeInTheDocument();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(toastSpy).toHaveBeenCalledWith("Nano S connected");

			toastSpy = jest.spyOn(toasts, "warning").mockImplementationOnce();
			userEvent.click(screen.getByText("Disconnect"));

			await waitFor(() => expect(toastSpy).toHaveBeenCalledWith("Nano S disconnected"));

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			getPublicKeySpy.mockReset();

			listenSpy.mockReset();
			toastSpy.mockRestore();
		});
	});
});
