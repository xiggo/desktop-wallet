/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { FirstStep } from "./Step1";
import { SecondStep } from "./Step2";
import { ThirdStep } from "./Step3";
import { WalletUpdate } from "./WalletUpdate";
import { render, screen, waitFor } from "@/utils/testing-library";
import * as updaterHook from "@/app/hooks/use-updater";

const firstStepID = "WalletUpdate__first-step";

describe("WalletUpdate", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(<WalletUpdate isOpen={false} />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 1st step", () => {
		const { asFragment } = render(<FirstStep />);

		expect(screen.getByTestId(firstStepID)).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 2nd step", () => {
		const { asFragment } = render(<SecondStep />);

		expect(screen.getByTestId("WalletUpdate__second-step")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 2nd step with progress status", () => {
		const { asFragment } = render(<SecondStep percent={20} />);

		expect(screen.getByTestId("WalletUpdate__second-step")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 3rd step", () => {
		const { asFragment } = render(<ThirdStep />);

		expect(screen.getByTestId("WalletUpdate__third-step")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render", async () => {
		const { asFragment } = render(<WalletUpdate isOpen={true} />);

		await expect(screen.findByTestId(firstStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", async () => {
		const onClose = jest.fn();
		render(<WalletUpdate isOpen={true} onClose={onClose} />);

		await expect(screen.findByTestId(firstStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));
		await waitFor(() => expect(onClose).toHaveBeenCalledWith());
	});

	it("should handle cancel", async () => {
		const onCancel = jest.fn();
		render(<WalletUpdate isOpen={true} onCancel={onCancel} />);

		await expect(screen.findByTestId(firstStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("WalletUpdate__cancel-button"));
		await waitFor(() => expect(onCancel).toHaveBeenCalledWith());
	});

	it("should handle update", async () => {
		render(<WalletUpdate isOpen={true} />);

		await expect(screen.findByTestId(firstStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("WalletUpdate__update-button"));

		await expect(screen.findByTestId("WalletUpdate__second-step")).resolves.toBeVisible();
	});

	it("should handle install", async () => {
		const quitInstall = jest.fn();
		// @ts-ignore
		jest.spyOn(updaterHook, "useUpdater").mockReturnValue({
			downloadStatus: "completed",
			quitInstall,
		});

		render(<WalletUpdate isOpen={true} />);
		userEvent.click(screen.getByTestId("WalletUpdate__install-button"));
		await waitFor(() => expect(quitInstall).toHaveBeenCalledWith(undefined));
	});
});
