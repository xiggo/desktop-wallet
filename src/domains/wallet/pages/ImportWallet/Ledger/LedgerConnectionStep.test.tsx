import Transport from "@ledgerhq/hw-transport";
import { createTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";
import { Contracts } from "@payvo/profiles";
import { renderHook } from "@testing-library/react-hooks";
import { EnvironmentProvider, minVersionList } from "app/contexts";
import { LedgerProvider } from "app/contexts/Ledger/Ledger";
import { createMemoryHistory } from "history";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render, screen, waitFor } from "utils/testing-library";

import { LedgerConnectionStep } from "./LedgerConnectionStep";

const history = createMemoryHistory();

let transport: typeof Transport;

describe("LedgerConnectionStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let getVersionSpy: jest.SpyInstance;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		getVersionSpy = jest
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		transport = createTransportReplayer(RecordStore.fromString(""));

		jest.spyOn(transport, "listen").mockImplementationOnce(() => ({ unsubscribe: jest.fn() }));

		jest.useFakeTimers();
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	it("should emit event on fail", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		jest.setTimeout(10_000);

		const getPublicKeySpy = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockRejectedValue(new Error(t("WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR")));

		const onFailed = jest.fn();

		const Component = () => {
			const form = useForm({
				defaultValues: {
					network: wallet.network(),
				},
			});
			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<LedgerProvider transport={transport}>
							<LedgerConnectionStep onFailed={onFailed} />
						</LedgerProvider>
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		history.push(`/profiles/${profile.id()}`);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		await screen.findByText("Open the ARK app on your device ...");

		await waitFor(() => expect(onFailed).toHaveBeenCalled(), { timeout: 10_000 });
		await screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR"));

		expect(container).toMatchSnapshot();

		getPublicKeySpy.mockReset();
	});

	it("should show update error if app version is less than minimum version", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		jest.setTimeout(10_000);

		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeySpy = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const outdatedVersion = "1.0.1";
		const getVersionSpy = jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue(outdatedVersion);

		const onFailed = jest.fn();

		const Component = () => {
			const form = useForm({
				defaultValues: {
					network: wallet.network(),
				},
			});
			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<LedgerProvider transport={transport}>
							<LedgerConnectionStep onFailed={onFailed} />
						</LedgerProvider>
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		history.push(`/profiles/${profile.id()}`);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		await screen.findByText("Open the ARK app on your device ...");

		await waitFor(() => expect(onFailed).toHaveBeenCalled(), { timeout: 10_000 });
		await screen.findByText(
			t("WALLETS.MODAL_LEDGER_WALLET.UPDATE_ERROR", {
				coin: wallet.network().coin(),
				version: outdatedVersion,
			}),
		);

		expect(container).toMatchSnapshot();

		getPublicKeySpy.mockReset();
		getVersionSpy.mockReset();
	});

	it("should emit event on connect", async () => {
		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeySpy = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const onConnect = jest.fn();

		const Component = () => {
			const form = useForm({
				defaultValues: {
					network: wallet.network(),
				},
			});
			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<LedgerProvider transport={transport}>
							<LedgerConnectionStep onConnect={onConnect} />
						</LedgerProvider>
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		history.push(`/profiles/${profile.id()}`);
		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		await screen.findByText("Successfully connected");
		await waitFor(() => expect(onConnect).toHaveBeenCalled());

		expect(container).toMatchSnapshot();

		getPublicKeySpy.mockReset();
	});
});
