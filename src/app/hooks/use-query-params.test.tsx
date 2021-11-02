import { fireEvent } from "@testing-library/react";
import React from "react";
import { Route } from "react-router-dom";
import { act, render } from "testing-library";

import { useQueryParams as useQueryParameters } from "./use-query-params";

describe("useQueryParams hook", () => {
	const TestComponent: React.FC = () => {
		const reloadPath = useQueryParameters();

		const handle = () => {
			reloadPath.get("");
		};
		return (
			<h1 data-testid="header_test" onClick={handle}>
				useQueryParams Test Component
			</h1>
		);
	};

	it("should render useQueryParams", () => {
		const { getByText, getByTestId } = render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
		);

		expect(getByTestId("header_test")).toBeInTheDocument();

		act(() => {
			fireEvent.click(getByTestId("header_test"));
		});

		expect(getByText("useQueryParams Test Component")).toBeInTheDocument();
	});
});
