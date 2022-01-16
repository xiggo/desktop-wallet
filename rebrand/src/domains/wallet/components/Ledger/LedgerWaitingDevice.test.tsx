import { Observer } from "@ledgerhq/hw-transport";
import userEvent from "@testing-library/user-event";
import React from "react";

import { LedgerWaitingDevice } from "./LedgerWaitingDevice";
import { LedgerProvider } from "@/app/contexts/Ledger/Ledger";
import { act, getDefaultLedgerTransport, render, screen } from "@/utils/testing-library";

const transport = getDefaultLedgerTransport();

describe("LedgerWaitingDevice", () => {
	it("should call the onClose callback if given", () => {
		const onClose = jest.fn();

		render(
			<LedgerProvider transport={transport}>
				<LedgerWaitingDevice isOpen={true} onClose={onClose} />
			</LedgerProvider>,
		);

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should emit true when devices is available", () => {
		const onDeviceAvailable = jest.fn();
		const unsubscribe = jest.fn();
		let observer: Observer<any>;

		const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});

		render(
			<LedgerProvider transport={transport}>
				<LedgerWaitingDevice isOpen={true} onDeviceAvailable={onDeviceAvailable} />
			</LedgerProvider>,
		);

		act(() => {
			observer!.next({ descriptor: "", type: "add" });
		});

		expect(onDeviceAvailable).toHaveBeenCalledWith(true);

		listenSpy.mockReset();
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		render(
			<LedgerProvider transport={transport}>
				<LedgerWaitingDevice isOpen={true} subtitle={subtitle} />
			</LedgerProvider>,
		);

		expect(screen.getByText(subtitle)).toBeInTheDocument();
	});
});
