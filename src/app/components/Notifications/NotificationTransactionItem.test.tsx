import { Contracts, DTO } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";

import { NotificationTransactionItem } from "./NotificationTransactionItem";
import { httpClient } from "@/app/services";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

const NotificationTransactionsFixtures = require("tests/fixtures/coins/ark/devnet/notification-transactions.json");
const TransactionsFixture = require("tests/fixtures/coins/ark/devnet/transactions.json");

let profile: Contracts.IProfile;
let notificationTransaction: DTO.ExtendedConfirmedTransactionData;

describe("Notifications", () => {
	beforeEach(async () => {
		httpClient.clearCache();

		nock("https://ark-test.payvo.com").get("/api/transactions").query(true).reply(200, {
			data: NotificationTransactionsFixtures.data,
			meta: TransactionsFixture.meta,
		});

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
		await profile.notifications().transactions().sync();
		notificationTransaction = profile.notifications().transactions().transaction(TransactionFixture.id());
	});

	it("should render notification item", async () => {
		const { container } = render(
			<table>
				<tbody>
					<NotificationTransactionItem transaction={notificationTransaction!} profile={profile} />
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("TransactionRowMode")).toHaveLength(1));

		expect(container).toMatchSnapshot();
	});

	it("should render notification item with wallet alias", async () => {
		render(
			<table>
				<tbody>
					<NotificationTransactionItem transaction={notificationTransaction!} profile={profile} />
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("TransactionRowMode")).toHaveLength(1));

		expect(screen.getByTestId("Address__alias")).toHaveTextContent("ARK Wallet 1");
	});

	it("should emit onVisibilityChange event", async () => {
		const onVisibilityChange = jest.fn();

		render(
			<table>
				<tbody>
					<NotificationTransactionItem
						transaction={notificationTransaction!}
						profile={profile}
						onVisibilityChange={onVisibilityChange}
					/>
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("TransactionRowMode")).toHaveLength(1));
		await waitFor(() => expect(onVisibilityChange).toHaveBeenCalledWith(expect.any(Boolean)));
	});

	it("should emit events onTransactionClick", async () => {
		const onTransactionClick = jest.fn();

		render(
			<table>
				<tbody>
					<NotificationTransactionItem
						transaction={notificationTransaction!}
						profile={profile}
						onTransactionClick={onTransactionClick}
					/>
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("TransactionRowMode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("TransactionRowMode"));

		await waitFor(() => expect(onTransactionClick).toHaveBeenCalledWith(notificationTransaction));
	});
});
