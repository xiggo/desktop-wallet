import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildTranslations } from "app/i18n/helpers";
import React from "react";
import { render } from "utils/testing-library";

import { UnlockTokensFetchError } from "./UnlockTokensFetchError";

const translations = buildTranslations();

describe("UnlockTokensFetchError", () => {
	it("should render", () => {
		const onRetry = jest.fn();

		const { asFragment } = render(<UnlockTokensFetchError onRetry={onRetry} />);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByText(translations.COMMON.HERE)).toBeInTheDocument();

		userEvent.click(screen.getByText(translations.COMMON.HERE));

		expect(onRetry).toHaveBeenCalledTimes(1);
	});
});
