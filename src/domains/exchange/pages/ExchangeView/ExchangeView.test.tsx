import React from "react";
import { Route } from "react-router-dom";
import { getDefaultProfileId, renderWithRouter } from "utils/testing-library";

import { ExchangeView } from "./ExchangeView";

const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange/view?exchangeId=exchangeId`;

describe("ExchangeView", () => {
	it("should render", () => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange/view">
				<ExchangeView />
			</Route>,
			{
				routes: [exchangeURL],
			},
		);

		expect(container).toMatchSnapshot();
	});
});
