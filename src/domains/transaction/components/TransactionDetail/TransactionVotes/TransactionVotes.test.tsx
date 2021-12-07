import { ReadOnlyWallet } from "@payvo/sdk-profiles";
import React from "react";

import { TransactionVotes } from "./TransactionVotes";
import { render, screen, waitFor } from "@/utils/testing-library";

const votes = [
	// @ts-ignore
	new ReadOnlyWallet({
		address: "test-address",
		username: "test-username",
	}),
];

describe("TransactionVotes", () => {
	it("should render loading state", () => {
		const { container } = render(<TransactionVotes isLoading={true} />);

		expect(screen.getByTestId("TransactionVotes__skeleton")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render with votes", async () => {
		const { container } = render(<TransactionVotes votes={votes} />);

		await expect(screen.findByText("Votes (1)")).resolves.toBeVisible();
		await expect(screen.findByText("test-username")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render with unvotes", async () => {
		const { container } = render(<TransactionVotes unvotes={votes} />);

		await expect(screen.findByText("Unvotes (1)")).resolves.toBeVisible();
		await expect(screen.findByText("test-username")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render with votes and unvotes", async () => {
		const { container } = render(<TransactionVotes votes={votes} unvotes={votes} />);

		await expect(screen.findByText("Votes (1)")).resolves.toBeVisible();
		await expect(screen.findByText("Unvotes (1)")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByText("test-username")).toHaveLength(2));

		expect(container).toMatchSnapshot();
	});
});
