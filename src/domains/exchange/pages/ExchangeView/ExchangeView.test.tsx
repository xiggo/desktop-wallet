import { ExchangeProvider, useExchangeContext } from "domains/exchange/contexts/Exchange";
import { createMemoryHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import { getDefaultProfileId, render, screen, waitFor } from "utils/testing-library";

import { ExchangeView } from "./ExchangeView";

const history = createMemoryHistory();

describe("ExchangeView", () => {
	const Wrapper = ({ children }: { children: React.ReactNode }) => {
		const { exchangeProviders, fetchProviders } = useExchangeContext();

		useEffect(() => {
			const _fetchProviders = async () => fetchProviders();

			if (!exchangeProviders?.length) {
				_fetchProviders();
			}
		}, [exchangeProviders, fetchProviders]);

		return children;
	};

	it("should render", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=changenow`;

		history.push(exchangeURL);

		const { container } = render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeView />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				routes: [exchangeURL],
			},
		);

		await waitFor(() => {
			expect(container).toHaveTextContent("world-map.svg");
		});

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm")).toBeInTheDocument();
		});

		const fromCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[0];
		const toCurrencyDropdown = screen.getAllByTestId("SelectDropdown__input")[1];
		const recipientDropdown = screen.getAllByTestId("SelectDropdown__input")[2];

		expect(fromCurrencyDropdown).toBeDisabled();
		expect(toCurrencyDropdown).toBeDisabled();
		expect(recipientDropdown).toBeDisabled();

		await waitFor(() => {
			expect(fromCurrencyDropdown).not.toBeDisabled();
		});

		await waitFor(() => {
			expect(toCurrencyDropdown).not.toBeDisabled();
		});

		expect(container).toMatchSnapshot();
	});

	it("should render warning without exchange", async () => {
		const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=unknown`;

		history.push(exchangeURL);

		const { container } = render(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeProvider>
					<Wrapper>
						<ExchangeView />
					</Wrapper>
				</ExchangeProvider>
			</Route>,
			{
				routes: [exchangeURL],
			},
		);

		await waitFor(() => {
			expect(container).toHaveTextContent("world-map.svg");
		});

		await waitFor(() => {
			expect(() => screen.getByTestId("ExchangeForm")).toThrow(/Unable to find an element by/);
		});

		expect(container).toMatchSnapshot();
	});
});
