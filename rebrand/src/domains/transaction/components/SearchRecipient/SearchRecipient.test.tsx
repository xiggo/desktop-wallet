import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SearchRecipient } from "./SearchRecipient";
import { RecipientProperties } from "./SearchRecipient.contracts";
import { translations } from "@/domains/transaction/i18n";
import { act, env, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";

let recipients: RecipientProperties[];

const modalDescription = () =>
	expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.DESCRIPTION);

describe("SearchRecipient", () => {
	beforeAll(() => {
		const profile: Contracts.IProfile = env.profiles().findById(getDefaultProfileId());
		const wallets: Contracts.IReadWriteWallet[] = profile.wallets().values();

		recipients = wallets.map((wallet) => ({
			address: wallet.address(),
			alias: wallet.alias(),
			avatar: wallet.avatar(),
			id: wallet.id(),
			network: wallet.networkId(),
			type: "wallet",
		}));
	});

	it("should not render if not open", () => {
		const { asFragment } = render(<SearchRecipient isOpen={false} recipients={recipients} onAction={jest.fn} />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(<SearchRecipient isOpen={true} recipients={recipients} onAction={jest.fn} />);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", () => {
		const onClose = jest.fn();

		render(<SearchRecipient isOpen={true} recipients={recipients} onClose={onClose} onAction={jest.fn} />);

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should render a modal with custom title and description", () => {
		const title = "Modal title";
		const description = "Modal description";
		const { asFragment } = render(
			<SearchRecipient
				isOpen={true}
				recipients={recipients}
				title={title}
				description={description}
				onAction={jest.fn()}
			/>,
		);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent("Modal title");
		expect(screen.getByTestId("modal__inner")).toHaveTextContent("Modal description");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with selected address", () => {
		const onAction = jest.fn();

		const { asFragment } = render(
			<SearchRecipient
				isOpen={true}
				recipients={recipients}
				selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				onAction={onAction}
			/>,
		);

		expect(screen.getByTestId("RecipientListItem__selected-button-0")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__selected-button-0"));

		expect(onAction).toHaveBeenCalledWith(recipients[0].address);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter recipients by address", async () => {
		jest.useFakeTimers();

		render(<SearchRecipient isOpen={true} recipients={recipients} onAction={jest.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "D8rr7B1d6TL6pf1");

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
		jest.useRealTimers();
	});

	it("should filter recipients by alias", async () => {
		jest.useFakeTimers();

		render(<SearchRecipient isOpen={true} recipients={recipients} onAction={jest.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "Ark Wallet 1");

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
		jest.useRealTimers();
	});

	it("should reset recipient search", async () => {
		jest.useFakeTimers();

		render(<SearchRecipient isOpen={true} recipients={recipients} onAction={jest.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "Ark Wallet 1");

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));

		// Reset search
		userEvent.click(screen.getByTestId("header-search-bar__reset"));

		await waitFor(() => expect(searchInput).not.toHaveValue());
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		jest.useRealTimers();
	});

	it("should not find recipient and show empty results screen", async () => {
		jest.useFakeTimers();

		render(<SearchRecipient isOpen={true} recipients={recipients} onAction={jest.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "non-existent recipient address");

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.getByTestId("Input")).toHaveValue("non-existent recipient address"));
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(0));

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();

		jest.useRealTimers();
	});
});
