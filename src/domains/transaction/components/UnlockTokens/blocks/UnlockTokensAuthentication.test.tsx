import { Contracts } from "@payvo/profiles";
import { screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { buildTranslations } from "app/i18n/helpers";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { env, getDefaultProfileId, render } from "utils/testing-library";

import { UnlockTokensAuthentication } from "./UnlockTokensAuthentication";

const translations = buildTranslations();

describe("UnlockTokensAuthentication", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	it("should render", async () => {
		const onBack = jest.fn();

		const { result, waitForNextUpdate } = renderHook(() => useForm({ mode: "onChange" }));

		const { asFragment } = render(
			<FormProvider {...result.current}>
				<UnlockTokensAuthentication wallet={wallet} onBack={onBack} />
			</FormProvider>,
		);

		await waitForNextUpdate();

		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		userEvent.click(screen.getByText(translations.COMMON.BACK));

		expect(onBack).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});
