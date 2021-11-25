import React from "react";

import { translations } from "@/domains/wallet/i18n";
import { render, screen } from "@/utils/testing-library";

import { DeleteWallet } from "./DeleteWallet";

const onDelete = jest.fn();

describe("DeleteWallet", () => {
	it("should render a modal", () => {
		const { asFragment } = render(<DeleteWallet isOpen={true} onDelete={onDelete} />);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_DELETE_WALLET.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_DELETE_WALLET.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});
});
