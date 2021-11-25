import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { DeleteProfile } from "./DeleteProfile";

let profile: Contracts.IProfile;

describe("DeleteProfile", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", async () => {
		const { asFragment } = render(<DeleteProfile isOpen profileId={profile.id()} />);

		await screen.findByTestId("modal__inner");

		expect(screen.getByTestId("DeleteResource__submit-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete", async () => {
		render(<DeleteProfile isOpen profileId={profile.id()} />);

		await screen.findByTestId("modal__inner");

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(env.profiles().values()).toHaveLength(1));
	});
});
