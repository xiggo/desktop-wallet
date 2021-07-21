import { Contracts } from "@payvo/profiles";
import { waitFor } from "@testing-library/react";
import nock from "nock";
import React from "react";
import { act } from "react-dom/test-utils";
import { env, fireEvent, getDefaultProfileId, render } from "testing-library";

import { Notifications } from ".";
const NotificationTransactionsFixtures = require("tests/fixtures/coins/ark/devnet/notification-transactions.json");
const TransactionsFixture = require("tests/fixtures/coins/ark/devnet/transactions.json");

let profile: Contracts.IProfile;

describe("Notifications", () => {
	beforeEach(async () => {
		nock("https://ark-test.payvo.com/api").get("/transactions").query(true).reply(200, {
			data: NotificationTransactionsFixtures.data,
			meta: TransactionsFixture.meta,
		});

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		profile
			.notifications()
			.releases()
			.push({
				meta: { version: "3.0.0" },
				name: "Wallet update",
			});

		await profile.notifications().transactions().sync();
	});

	it("should render with plugins", async () => {
		const { container, queryAllByTestId } = render(<Notifications profile={profile} />);
		await waitFor(() => expect(queryAllByTestId("TransactionRowMode")).not.toHaveLength(0));

		expect(container).toMatchSnapshot();
	});

	it("should render with transactions and plugins", async () => {
		const { container, getAllByTestId, queryAllByTestId } = render(<Notifications profile={profile} />);

		await waitFor(() => expect(getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(queryAllByTestId("TransactionRowMode").length).toBeGreaterThan(0));

		expect(container).toMatchSnapshot();
	});

	it("should emit onNotificationAction event", async () => {
		const onNotificationAction = jest.fn();

		const { getAllByTestId, queryAllByTestId } = render(
			<Notifications profile={profile} onNotificationAction={onNotificationAction} />,
		);
		await waitFor(() => expect(getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(queryAllByTestId("TransactionRowMode").length).toBeGreaterThan(0));

		act(() => {
			fireEvent.click(getAllByTestId("NotificationItem__action")[1]);
		});

		await waitFor(() => expect(onNotificationAction).toHaveBeenCalled());
	});

	it("should emit transactionClick event", async () => {
		const onTransactionClick = jest.fn();

		const { container, getAllByTestId, queryAllByTestId } = render(
			<Notifications profile={profile} onTransactionClick={onTransactionClick} />,
		);

		await waitFor(() => expect(getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(queryAllByTestId("TransactionRowMode").length).toBeGreaterThan(0));

		act(() => {
			fireEvent.click(getAllByTestId("TransactionRowMode")[0]);
		});

		await waitFor(() => expect(onTransactionClick).toHaveBeenCalled());

		expect(container).toMatchSnapshot();
	});

	it("should render with empty notifications", async () => {
		profile.notifications().flush();
		const { container, queryAllByTestId } = render(<Notifications profile={profile} />);
		await waitFor(() => expect(queryAllByTestId("TransactionRowMode")).toHaveLength(0));

		expect(container).toMatchSnapshot();
	});
});
