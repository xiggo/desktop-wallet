import { LSK } from "@payvo/sdk-lsk";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { env, render, screen } from "utils/testing-library";
import { PortfolioBreakdown } from "./PortfolioBreakdown";
import { GRAPH_MIN_VALUE } from "@/app/components/Graphs/Graphs.contracts";
import * as sharedGraphUtils from "@/app/components/Graphs/Graphs.shared";
import * as useThemeHook from "@/app/hooks/use-theme";
import { buildTranslations } from "@/app/i18n/helpers";

const translations = buildTranslations();

describe("PortfolioBreakdown", () => {
	let profile: Contracts.IProfile;

	let arkWallet: Contracts.IReadWriteWallet;
	let lskWallet: Contracts.IReadWriteWallet;

	let portfolioBreakdownMock: jest.SpyInstance;
	let isRestoredMock: jest.SpyInstance;

	let useGraphWidthMock: jest.SpyInstance;

	const liveNetworkIds = ["ark.mainnet", "lsk.mainnet"];

	beforeAll(async () => {
		nock.disableNetConnect();

		env.registerCoin("LSK", LSK);

		profile = env.profiles().create("blank");

		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, "USD");

		let walletData: {
			mnemonic: string;
			wallet: Contracts.IReadWriteWallet;
		};

		walletData = await profile.walletFactory().generate({ coin: "ARK", network: "ark.mainnet" });
		arkWallet = walletData.wallet;

		walletData = await profile.walletFactory().generate({ coin: "LSK", network: "lsk.mainnet" });
		lskWallet = walletData.wallet;

		profile.wallets().push(arkWallet);
		profile.wallets().push(lskWallet);

		// Mock graph width to a value that would use 5% as minimum threshold for visible data points.
		useGraphWidthMock = jest
			.spyOn(sharedGraphUtils, "useGraphWidth")
			.mockReturnValue([undefined as never, GRAPH_MIN_VALUE.line / 5]);
	});

	afterAll(() => {
		nock.enableNetConnect();

		env.profiles().forget(profile.id());

		useGraphWidthMock.mockRestore();
	});

	beforeEach(() => {
		portfolioBreakdownMock = jest.spyOn(profile.portfolio(), "breakdown").mockReturnValue([
			{ coin: arkWallet.coin(), shares: 85, source: 85, target: 85 },
			{ coin: lskWallet.coin(), shares: 15, source: 15, target: 15 },
		]);

		isRestoredMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(true);
	});

	afterEach(() => {
		portfolioBreakdownMock.mockRestore();
		isRestoredMock.mockRestore();
	});

	it.each([true, false])("should render with dark mode = %s", (isDarkMode) => {
		const useThemeMock = jest.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown")).toBeInTheDocument();

		expect(screen.getByTestId("Amount")).toHaveTextContent("$100.00");
		expect(screen.getByTestId("PortfolioBreakdown__assets")).toHaveTextContent("2");
		expect(screen.getByTestId("PortfolioBreakdown__wallets")).toHaveTextContent("2");

		expect(screen.getByTestId("LineGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("LineGraph__item")).toHaveLength(2);

		expect(screen.getByText(translations.COMMON.MORE_DETAILS)).not.toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		useThemeMock.mockRestore();
	});

	it("should render loading when syncing exchange rates", () => {
		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={true}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading when profile is not restored yet", () => {
		isRestoredMock.mockReturnValue(false);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading when items converted balance contain a NaN value", () => {
		portfolioBreakdownMock = jest.spyOn(profile.portfolio(), "breakdown").mockReturnValue([
			{ coin: arkWallet.coin(), shares: 85, source: 85, target: 85 },
			{ coin: lskWallet.coin(), shares: 15, source: 15, target: Number.NaN },
		]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should return nothing when portfolio is empty and there are no filtered networks", () => {
		portfolioBreakdownMock.mockReturnValue([]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(asFragment()).toMatchInlineSnapshot("<DocumentFragment />");
	});

	it("should render empty block when portfolio is empty and there are filtered networks", () => {
		portfolioBreakdownMock.mockReturnValue([]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={["ark.mainnet"]}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			/Please enable at least one public network to display your portfolio report/,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty (filtered) message when there are no assets that match the current network filters", () => {
		portfolioBreakdownMock.mockReturnValue([]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={[]}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			/Please enable at least one public network to display your portfolio report/,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render zero balance state with dark mode = %s", (isDarkMode) => {
		const useThemeMock = jest.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		portfolioBreakdownMock = jest.spyOn(profile.portfolio(), "breakdown").mockReturnValue([
			{ coin: arkWallet.coin(), shares: 0, source: 0, target: 0 },
			{ coin: lskWallet.coin(), shares: 0, source: 0, target: 0 },
		]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown")).toBeInTheDocument();
		expect(screen.getByTestId("LineGraph__empty")).toBeInTheDocument();

		expect(screen.getByText(translations.COMMON.MORE_DETAILS)).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		useThemeMock.mockRestore();
	});

	it("should have a button to open detail modal", () => {
		render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByText(translations.COMMON.MORE_DETAILS)).toBeEnabled();

		userEvent.click(screen.getByText(translations.COMMON.MORE_DETAILS));

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		expect(screen.getByText(translations.DASHBOARD.PORTFOLIO_BREAKDOWN_DETAILS.TITLE)).toBeInTheDocument();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
	});

	it.each([true, false])("should show tooltip when hovering graph elements when dark mode is = %s", (isDarkMode) => {
		const useThemeMock = jest.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("LineGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("LineGraph__item")).toHaveLength(2);

		expect(screen.queryByTestId("PortfolioBreakdown__tooltip")).not.toBeInTheDocument();

		userEvent.hover(screen.getAllByTestId("LineGraph__item-hover-area")[0]);

		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toBeInTheDocument();
		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/ARK/);
		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/\$85.00/);
		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/85%/);

		userEvent.unhover(screen.getAllByTestId("LineGraph__item-hover-area")[0]);
		userEvent.hover(screen.getAllByTestId("LineGraph__item-hover-area")[1]);

		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/LSK/);
		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/\$15.00/);
		expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/15%/);

		useThemeMock.mockRestore();
	});

	it("should filter by selected networks", () => {
		const { rerender } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={["ark.mainnet"]}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown")).toBeInTheDocument();

		expect(screen.getByTestId("PortfolioBreakdown__wallets")).toHaveTextContent("1");

		rerender(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown__wallets")).toHaveTextContent("2");
	});
});
