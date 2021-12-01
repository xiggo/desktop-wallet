import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ConfigurationProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations } from "@/domains/profile/i18n";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { WelcomeModal } from "./WelcomeModal";

let profile: Contracts.IProfile;
let mockHasCompletedTutorial: jest.SpyInstance<boolean, []>;

const Wrapper = () => (
	<ConfigurationProvider defaultConfiguration={{ profileIsSyncing: false }}>
		<WelcomeModal profile={profile} environment={env} />
	</ConfigurationProvider>
);

describe("WelcomeModal", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		mockHasCompletedTutorial = jest.spyOn(profile, "hasCompletedIntroductoryTutorial");
	});

	afterEach(() => {
		mockHasCompletedTutorial.mockRestore();
	});

	it("should not render if user completed the tutorial", () => {
		mockHasCompletedTutorial.mockReturnValue(true);
		const { asFragment } = render(<Wrapper />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal if user hasnt completed the tutorial", () => {
		mockHasCompletedTutorial.mockReturnValue(false);

		const { asFragment } = render(<Wrapper />);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_WELCOME.STEP_1_TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.MODAL_WELCOME.DONT_SHOW_CHECKBOX_LABEL,
		);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(commonTranslations.START);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(commonTranslations.SKIP);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show navigation buttons according to the step", () => {
		mockHasCompletedTutorial.mockReturnValue(false);

		render(<Wrapper />);

		expect(screen.getByTestId("WelcomeModal-skip")).toBeDefined();
		expect(screen.getByTestId("WelcomeModal-next")).toBeDefined();
		expect(screen.queryByTestId("DotNavigation")).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-finish")).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-prev")).not.toBeInTheDocument();

		// Intermediate steps
		for (const _ of [1, 2, 3]) {
			userEvent.click(screen.getByTestId("WelcomeModal-next"));

			expect(screen.getByTestId("WelcomeModal-next")).toBeDefined();
			expect(screen.getByTestId("WelcomeModal-prev")).toBeDefined();
			expect(screen.getByTestId("DotNavigation")).toBeDefined();
			expect(screen.queryByTestId("WelcomeModal-finish")).not.toBeInTheDocument();
			expect(screen.queryByTestId("WelcomeModal-skip")).not.toBeInTheDocument();
		});

		// Final step
		userEvent.click(screen.getByTestId("WelcomeModal-next"));

		expect(screen.getByTestId("WelcomeModal-finish")).toBeDefined();
		expect(screen.getByTestId("WelcomeModal-prev")).toBeDefined();
		expect(screen.getByTestId("DotNavigation")).toBeDefined();
		expect(screen.queryByTestId("WelcomeModal-next")).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-skip")).not.toBeInTheDocument();
	});

	it("can change the current step with the navigation dots", () => {
		mockHasCompletedTutorial.mockReturnValue(false);

		render(<Wrapper />);

		// Got to first step (to show the navigation dots)
		userEvent.click(screen.getByTestId("WelcomeModal-next"));

		// Go to final step
		userEvent.click(screen.getByTestId("DotNavigation-Step-3"));

		expect(screen.getByTestId("WelcomeModal-finish")).toBeDefined();
		expect(screen.getByTestId("WelcomeModal-prev")).toBeDefined();
		expect(screen.getByTestId("DotNavigation")).toBeDefined();
		expect(screen.queryByTestId("WelcomeModal-next")).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-skip")).not.toBeInTheDocument();
	});
});
