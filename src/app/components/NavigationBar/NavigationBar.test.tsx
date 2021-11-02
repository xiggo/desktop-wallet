/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/profiles";
import { fireEvent, waitFor } from "@testing-library/react";
import * as navigation from "app/constants/navigation";
import * as environmentHooks from "app/hooks/env";
import * as useScrollHook from "app/hooks/use-scroll";
import { createMemoryHistory } from "history";
import React from "react";
import { act } from "react-dom/test-utils";
import { Route } from "react-router-dom";
import { env as mockedTestEnvironment, getDefaultProfileId, renderWithRouter } from "utils/testing-library";

import { NavigationBar } from "./NavigationBar";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createMemoryHistory();

jest.spyOn(environmentHooks, "useActiveProfile").mockImplementation(() =>
	mockedTestEnvironment.profiles().findById(getDefaultProfileId()),
);

jest.spyOn(navigation, "getNavigationMenu").mockReturnValue([
	{
		mountPath: (profileId: string) => `/profiles/${profileId}/dashboard`,
		title: "Portfolio",
	},
	{
		mountPath: () => "/test",
		title: "test",
	},
]);

describe("NavigationBar", () => {
	beforeAll(async () => {
		history.push(dashboardURL);
	});

	it("should render", () => {
		const { container, asFragment } = renderWithRouter(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as logo-only variant", () => {
		const { container, asFragment } = renderWithRouter(<NavigationBar variant="logo-only" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with shadow if there is a scroll", () => {
		const scrollSpy = jest.spyOn(useScrollHook, "useScroll").mockImplementation(() => 1);

		const { container, asFragment } = renderWithRouter(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		scrollSpy.mockRestore();
	});

	it("should render with title", () => {
		const title = "Desktop Wallet";

		const { container, asFragment } = renderWithRouter(<NavigationBar title={title} />);

		expect(container).toBeInTheDocument();
		expect(container).toHaveTextContent(title);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom menu", () => {
		const { container, asFragment } = renderWithRouter(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without profile", () => {
		const { container } = renderWithRouter(<NavigationBar />);

		expect(container).toBeInTheDocument();
	});

	it("should handle menu click", () => {
		const { getByText, history } = renderWithRouter(<NavigationBar />);

		fireEvent.click(getByText("test"));

		expect(history.location.pathname).toEqual("/test");
	});

	it("should open user actions dropdown on click", () => {
		const getUserInfoActionsMock = jest.spyOn(navigation, "getUserInfoActions").mockReturnValue([
			{ label: "Option 1", mountPath: () => "/test", title: "test", value: "/test" },
			{ label: "Option 2", mountPath: () => "/test2", title: "test2", value: "/test2" },
		]);

		const { getByTestId, getByText, history } = renderWithRouter(<NavigationBar />);
		const toggle = getByTestId("navbar__useractions");

		act(() => {
			fireEvent.click(toggle);
		});

		expect(getByText("Option 1")).toBeInTheDocument();

		fireEvent.click(getByText("Option 1"));

		expect(history.location.pathname).toMatch("/test");

		getUserInfoActionsMock.mockRestore();
	});

	it("should handle click to send button", () => {
		const mockProfile = environmentHooks.useActiveProfile();
		const { getByTestId, history } = renderWithRouter(<NavigationBar />);

		const sendButton = getByTestId("navbar__buttons--send");

		act(() => {
			fireEvent.click(sendButton);
		});

		expect(history.location.pathname).toMatch(`/profiles/${mockProfile.id()}/send-transfer`);
	});

	it("should handle receive funds", async () => {
		const { findByTestId, getAllByText, getByTestId, queryAllByTestId } = renderWithRouter(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		act(() => {
			fireEvent.click(getByTestId("navbar__buttons--receive"));
		});

		expect(await findByTestId("modal__inner")).toHaveTextContent("Select Account");

		act(() => {
			fireEvent.click(getAllByText("Select")[0]);
		});

		await findByTestId("ReceiveFunds__name");
		await findByTestId("ReceiveFunds__address");
		await waitFor(() => expect(queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		act(() => {
			fireEvent.click(getByTestId("modal__close-btn"));
		});

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
	});

	it("should close the search wallet modal", async () => {
		const { findByTestId, getByTestId } = renderWithRouter(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		const receiveFundsButton = getByTestId("navbar__buttons--receive");

		act(() => {
			fireEvent.click(receiveFundsButton);
		});

		expect(await findByTestId("modal__inner")).toHaveTextContent("Select Account");

		act(() => {
			fireEvent.click(getByTestId("modal__close-btn"));
		});

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
	});

	it("should not render if no active profile", () => {
		const { asFragment } = renderWithRouter(<NavigationBar />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should disable send transfer button when no Live wallets in test network", () => {
		const mockProfile = environmentHooks.useActiveProfile();
		const useNetworksMock = jest.spyOn(mockProfile.settings(), "get").mockImplementation((key: string) => {
			if (key === Contracts.ProfileSetting.UseTestNetworks) {
				return false;
			}
			if (key === Contracts.ProfileSetting.ExchangeCurrency) {
				return "USD";
			}

			return "";
		});

		const { container, getByTestId } = renderWithRouter(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(getByTestId("navbar__buttons--send")).toHaveAttribute("disabled");

		useNetworksMock.mockRestore();
	});
});
