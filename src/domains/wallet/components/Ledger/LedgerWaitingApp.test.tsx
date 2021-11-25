import userEvent from "@testing-library/user-event";
import React from "react";

import { render, screen } from "@/utils/testing-library";

import { LedgerWaitingApp } from "./LedgerWaitingApp";

describe("LedgerWaitingApp", () => {
	it("should call the onClose callback if given", () => {
		const onClose = jest.fn();

		render(<LedgerWaitingApp isOpen={true} coinName="ARK" onClose={onClose} />);

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		render(<LedgerWaitingApp isOpen={true} coinName="ARK" subtitle={subtitle} />);

		expect(screen.getByText(subtitle)).toBeInTheDocument();
	});
});
