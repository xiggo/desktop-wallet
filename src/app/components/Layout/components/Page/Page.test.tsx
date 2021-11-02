import { Contracts } from "@payvo/profiles";
import electron from "electron";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { act, env, fireEvent, getDefaultProfileId, renderWithRouter } from "utils/testing-library";

import { Page } from "./Page";

let profile: Contracts.IProfile;

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createMemoryHistory();

describe("Page", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		history.push(dashboardURL);
	});

	it("should render", () => {
		const sidebar = true;

		const { container, asFragment } = renderWithRouter(
			<Page title="Test" sidebar={sidebar}>
				{}
			</Page>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without sidebar", () => {
		const { container, asFragment } = renderWithRouter(<Page title="Test">{}</Page>);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["Contacts", "Votes", "Settings", "Support"])(
		"should handle '%s' click on user actions dropdown",
		async (label) => {
			const ipcRendererSpy = jest.spyOn(electron.ipcRenderer, "send").mockImplementation();
			const historySpy = jest.spyOn(history, "push").mockImplementation();

			const { getByTestId, findByText, findByTestId } = renderWithRouter(
				<Route path="/profiles/:profileId/dashboard">
					<Page>{}</Page>
				</Route>,
				{
					history,
					routes: [dashboardURL],
				},
			);

			await findByTestId("navbar__useractions");

			const toggle = getByTestId("navbar__useractions");

			act(() => {
				fireEvent.click(toggle);
			});

			await findByText(label);

			fireEvent.click(await findByText(label));

			if (label === "Support") {
				expect(ipcRendererSpy).toHaveBeenCalledWith("open-external", "https://payvo.com/contact");
			} else {
				expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/${label.toLowerCase()}`);
			}

			ipcRendererSpy.mockRestore();
			historySpy.mockRestore();
		},
	);

	it("should handle 'Sign Out' click on user actions dropdown", async () => {
		const { getByTestId, findByText, findByTestId } = renderWithRouter(
			<Route path="/profiles/:profileId/dashboard">
				<Page>{}</Page>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await findByTestId("navbar__useractions");

		const toggle = getByTestId("navbar__useractions");

		act(() => {
			fireEvent.click(toggle);
		});

		await findByText("Sign Out");

		fireEvent.click(await findByText("Sign Out"));

		expect(historySpy).toHaveBeenCalledWith("/");

		historySpy.mockRestore();
	});
});
