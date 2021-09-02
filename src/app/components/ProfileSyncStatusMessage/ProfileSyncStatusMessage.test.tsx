import React from "react";
import { act } from "react-dom/test-utils";
import { Route } from "react-router-dom";
import { fireEvent, renderWithRouter, waitFor } from "utils/testing-library";

import { SyncErrorMessage } from "./ProfileSyncStatusMessage";

describe("SyncErrorMessage", () => {
	const failedNetworkNames = ["ARK Devnet", "ARK Mainnet", "Lisk Devnet"];

	it("should render one failed network", async () => {
		const { container, getByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={[failedNetworkNames[0]]} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await waitFor(() => expect(getByText(failedNetworkNames[0])).toBeInTheDocument());

		expect(container).toMatchSnapshot();
	});

	it("should render two failed networks", async () => {
		const { container, getByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={[failedNetworkNames[0], failedNetworkNames[1]]} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await waitFor(() => expect(getByText(failedNetworkNames[0])).toBeInTheDocument());
		await waitFor(() => expect(getByText(failedNetworkNames[1])).toBeInTheDocument());

		expect(container).toMatchSnapshot();
	});

	it("should render multiple failed networks", async () => {
		const { container, getByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={failedNetworkNames} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await waitFor(() => expect(getByText(failedNetworkNames[0])).toBeInTheDocument());
		await waitFor(() => expect(getByText(failedNetworkNames[1])).toBeInTheDocument());

		expect(container).toMatchSnapshot();
	});

	it("should handle retry", async () => {
		const onRetry = jest.fn();
		const { container, getByText, getByTestId } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={failedNetworkNames} onRetry={onRetry} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await waitFor(() => expect(getByText(failedNetworkNames[0])).toBeInTheDocument());
		await waitFor(() => expect(getByText(failedNetworkNames[1])).toBeInTheDocument());
		await waitFor(() => expect(getByText(failedNetworkNames[2])).toBeInTheDocument());

		act(() => {
			fireEvent.click(getByTestId("SyncErrorMessage__retry"));
		});

		await waitFor(() => expect(onRetry).toHaveBeenCalled());

		expect(container).toMatchSnapshot();
	});
});
