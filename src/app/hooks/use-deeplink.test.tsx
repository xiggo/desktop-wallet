import { ipcRenderer } from "electron";
import React from "react";
import { Route } from "react-router-dom";

import { useDeeplink } from "./use-deeplink";
import { translations } from "@/app/i18n/common/i18n";
import { toasts } from "@/app/services";
import { getDefaultProfileId, getDefaultWalletId, render, screen } from "@/utils/testing-library";

const walletURL = `/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`;

const ipcRendererMockImplementation = (event, callback) => {
	callback(
		event,
		"payvo:transfer?coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
	);
};

const deeplinkTest = "Deeplink Test";
const processURL = "process-url";

const deeplinkTestContent = () => screen.getByText(deeplinkTest);

describe("useDeeplink hook", () => {
	const toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementationOnce((subject) => jest.fn(subject));
	const toastErrorSpy = jest.spyOn(toasts, "error").mockImplementationOnce((subject) => jest.fn(subject));

	beforeEach(() => {
		jest.clearAllMocks();
	});

	const TestComponent: React.FC = () => {
		useDeeplink();

		return <h1>Deeplink Test</h1>;
	};

	it("should subscribe to deeplink listener", () => {
		ipcRenderer.on.mockImplementationOnce(ipcRendererMockImplementation);

		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should subscribe to deeplink listener and toast a warning to select a profile", () => {
		ipcRenderer.on.mockImplementationOnce(ipcRendererMockImplementation);

		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
			{
				routes: ["/"],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastWarningSpy).toHaveBeenCalledWith(translations.SELECT_A_PROFILE);
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should subscribe to deeplink listener and toast a warning to coin not supported", () => {
		ipcRenderer.on.mockImplementationOnce((event, callback) =>
			callback(
				event,
				"payvo:transfer?coin=doge&network=mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
			),
		);

		window.history.pushState({}, deeplinkTest, `/profiles/${getDefaultProfileId()}/dashboard`);

		render(
			<Route pathname="/profiles/:profileId">
				<TestComponent />
			</Route>,
			{
				routes: [`/profiles/${getDefaultProfileId()}/dashboard`],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastErrorSpy).toHaveBeenLastCalledWith('Invalid URI: Coin "doge" not supported.');
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should subscribe to deeplink listener and toast a warning to network not supported", () => {
		ipcRenderer.on.mockImplementationOnce((event, callback) =>
			callback(
				event,
				"payvo:transfer?coin=ark&network=custom&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
			),
		);

		window.history.pushState({}, deeplinkTest, `/profiles/${getDefaultProfileId()}/dashboard`);

		render(
			<Route pathname="/profiles/:profileId">
				<TestComponent />
			</Route>,
			{
				routes: [`/profiles/${getDefaultProfileId()}/dashboard`],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastErrorSpy).toHaveBeenCalledWith('Invalid URI: Network "custom" not supported.');
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should subscribe to deeplink listener and toast a warning to no senders available", () => {
		ipcRenderer.on.mockImplementationOnce(ipcRendererMockImplementation);

		window.history.pushState({}, deeplinkTest, `/profiles/${getDefaultProfileId()}/dashboard`);

		render(
			<Route pathname="/profiles/:profileId">
				<TestComponent />
			</Route>,
			{
				routes: [`/profiles/${getDefaultProfileId()}/dashboard`],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastErrorSpy).toHaveBeenCalledWith(
			'Invalid URI: The current profile has no wallets available for the "ark.mainnet" network',
		);
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should subscribe to deeplink listener and navigate", () => {
		ipcRenderer.on.mockImplementationOnce((event, callback) =>
			callback(
				event,
				"payvo:transfer?coin=ark&network=ark.devnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
			),
		);

		window.history.pushState(
			{},
			deeplinkTest,
			`/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`,
		);

		const { history } = render(
			<Route pathname="/profiles/:profileId/wallets/:walletId">
				<TestComponent />
			</Route>,
			{
				routes: [walletURL],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/send-transfer`);
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should subscribe to deeplink listener and navigate when no method found", () => {
		ipcRenderer.on.mockImplementationOnce((event, callback) =>
			callback(event, "payvo:vote?coin=ark&network=ark.devnet&delegate=alessio"),
		);

		window.history.pushState(
			{},
			deeplinkTest,
			`/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`,
		);

		const { history } = render(
			<Route pathname="/profiles/:profileId/wallets/:walletId">
				<TestComponent />
			</Route>,
			{
				routes: [walletURL],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(history.location.pathname).toBe("/");
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});

	it("should not use create", () => {
		ipcRenderer.on.mockImplementationOnce((event, callback) =>
			callback(event, "payvo:vote?coin=ark&network=ark.devnet&delegate=alessio"),
		);

		render(
			<Route pathname="/profiles/create">
				<TestComponent />
			</Route>,
			{
				routes: ["/profiles/create"],
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(ipcRenderer.on).toHaveBeenCalledWith(processURL, expect.any(Function));
	});
});
