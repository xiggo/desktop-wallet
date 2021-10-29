import React from "react";
import { act } from "react-dom/test-utils";
import { Route } from "react-router-dom";
import { fireEvent, renderWithRouter, waitFor } from "utils/testing-library";

import { SyncErrorMessage } from "./ProfileSyncStatusMessage";

describe("SyncErrorMessage", () => {
	const failedNetworkNames = ["ARK Devnet", "ARK Mainnet", "Lisk Devnet"];

	it("should render one failed network", async () => {
		const { container, findByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={[failedNetworkNames[0]]} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await findByText(failedNetworkNames[0]);

		expect(container).toMatchSnapshot();
	});

	it("should render two failed networks", async () => {
		const { container, findByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={[failedNetworkNames[0], failedNetworkNames[1]]} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await findByText(failedNetworkNames[0]);
		await findByText(failedNetworkNames[1]);

		expect(container).toMatchSnapshot();
	});

	it("should render multiple failed networks", async () => {
		const { container, findByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={failedNetworkNames} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await findByText(failedNetworkNames[0]);
		await findByText(failedNetworkNames[1]);

		expect(container).toMatchSnapshot();
	});

	it("should handle retry", async () => {
		const onRetry = jest.fn();
		const { container, getByTestId, findByText } = renderWithRouter(
			<Route path="/">
				<SyncErrorMessage failedNetworkNames={failedNetworkNames} onRetry={onRetry} />
			</Route>,
			{
				routes: ["/"],
			},
		);

		await findByText(failedNetworkNames[0]);
		await findByText(failedNetworkNames[1]);
		await findByText(failedNetworkNames[2]);

		act(() => {
			fireEvent.click(getByTestId("SyncErrorMessage__retry"));
		});

		await waitFor(() => expect(onRetry).toHaveBeenCalled());

		expect(container).toMatchSnapshot();
	});
});
