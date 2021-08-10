import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { getDefaultProfileId, renderWithRouter } from "testing-library";

import { translations } from "../../i18n";
import { Exchange } from "./Exchange";

const history = createMemoryHistory();

const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange`;

describe("Exchange", () => {
	beforeEach(() => {
		history.push(exchangeURL);
	});

	it("should render empty", () => {
		const { container, getByTestId } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		expect(getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		expect(getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		expect(getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});
});
