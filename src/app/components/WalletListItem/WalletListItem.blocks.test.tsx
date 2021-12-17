import { Contracts } from "@payvo/sdk-profiles";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render } from "utils/testing-library";
import * as useConfigurationModule from "@/app/contexts/Configuration/Configuration";
import { ButtonsCell, CurrencyCell, WalletCell } from "@/app/components/WalletListItem/WalletListItem.blocks";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createMemoryHistory();

describe("WalletListItem.blocks", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render WalletCell", () => {
		const walletSpy = jest.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<WalletCell wallet={wallet} handleToggleStar={jest.fn()} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.hover(screen.getByTestId("WalletIcon__Starred"));

		expect(screen.getByText(walletTranslations.PAGE_WALLET_DETAILS.STAR_WALLET)).toBeInTheDocument();
		expect(screen.getByText("star.svg")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should render CurrencyCell", () => {
		const useConfigurationReturn = { profileIsSyncingExchangeRates: true };
		const useConfigurationSpy = jest
			.spyOn(useConfigurationModule, "useConfiguration")
			.mockReturnValue(useConfigurationReturn);
		const walletSpy = jest.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		const { asFragment, rerender } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<CurrencyCell wallet={wallet} isSynced={true} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("CurrencyCell").querySelector(".react-loading-skeleton")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		useConfigurationReturn.profileIsSyncingExchangeRates = false;
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<CurrencyCell wallet={wallet} isSynced={false} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
		);

		expect(screen.getByText(commonTranslations.NOT_AVAILABLE)).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<CurrencyCell wallet={wallet} isSynced={true} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
		);

		expect(screen.getByTestId("Amount")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
		useConfigurationSpy.mockRestore();
	});

	it("should avoid click on ButtonsCell when Send button is disabled", () => {
		const walletSpy = jest.spyOn(wallet, "balance").mockReturnValue(0);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<ButtonsCell
								wallet={wallet}
								isCompact={true}
								handleSelectOption={jest.fn()}
								handleSend={jest.fn()}
							/>
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByTestId("WalletHeader__send-button"));

		expect(history.location.pathname).toBe(dashboardURL);

		walletSpy.mockRestore();
	});
});
