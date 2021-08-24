/* eslint-disable @typescript-eslint/require-await */

import { Contracts } from "@payvo/profiles";
import { ipcRenderer } from "electron";
import { PluginManager } from "plugins";
import { PluginManagerProvider } from "plugins/context/PluginManagerProvider";
import React from "react";
import { env, fireEvent, getDefaultProfileId, render, waitFor } from "utils/testing-library";

import { InstallPlugin } from "./InstallPlugin";
import { FirstStep } from "./Step1";
import { SecondStep } from "./Step2";
import { ThirdStep } from "./Step3";

describe("InstallPlugin", () => {
	let profile: Contracts.IProfile;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should not render if not open", () => {
		const { asFragment, getByTestId } = render(
			<PluginManagerProvider manager={new PluginManager()} services={[]}>
				<InstallPlugin profile={profile} isOpen={false} />
			</PluginManagerProvider>,
		);

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 1st step", async () => {
		const { getByTestId, asFragment } = render(
			<FirstStep plugin={{ permissions: ["PROFILE", "EVENTS", "HTTP", "CUSTOM_PERMISSION"] }} />,
		);

		expect(getByTestId("InstallPlugin__step--first")).toBeTruthy();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 2st step with partial download progress", async () => {
		const { getByTestId, asFragment } = render(
			<SecondStep plugin={{ size: "0 B", title: "My Plugin" }} downloadProgress={{ totalBytes: 100 }} />,
		);

		expect(getByTestId("InstallPlugin__step--second__progress")).toHaveTextContent("0 B / 100 B");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 2st step with full download progress", async () => {
		const { getByTestId, asFragment } = render(
			<SecondStep
				plugin={{ logo: "https://payvo.com/logo.png", size: "100 B", title: "My Plugin" }}
				downloadProgress={{ percent: 1, totalBytes: 100, transferredBytes: 100 }}
			/>,
		);

		expect(getByTestId("InstallPlugin__step--second__progress")).toHaveTextContent("100 B / 100 B");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 3st step", async () => {
		const { getByTestId, asFragment } = render(<ThirdStep plugin={{ title: "My Plugin" }} />);

		expect(getByTestId("InstallPlugin__step--third")).toBeTruthy();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 3st step with plugin logo", async () => {
		const { getByTestId, asFragment } = render(
			<ThirdStep plugin={{ logo: "https://payvo.com/logo.png", title: "My Plugin" }} />,
		);

		expect(getByTestId("PluginImage")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should download and install plugin", async () => {
		const cancelInstall = jest.fn();

		jest.spyOn(ipcRenderer, "on").mockImplementation(((channel: string, listener: (...args: any[]) => void) => {
			if (channel === "plugin:download-progress") {
				return listener(undefined, { totalBytes: 200 });
			}
		}) as any);

		const invokeSpy = jest.spyOn(ipcRenderer, "invoke").mockImplementation((channel, ...args) => {
			if (channel === "plugin:loader-fs.find") {
				return Promise.resolve({
					config: { keywords: ["@payvo", "wallet-plugin"], name: "remote-plugin", version: "0.0.1" },
					dir: "/plugins/remote-plugin",
					source: () => void 0,
					sourcePath: "/plugins/remote-plugin/index.js",
				});
			}

			if (channel === "plugin:install") {
				return Promise.resolve("/Users/plugins/remote-plugin");
			}

			if (channel === "plugin:download") {
				return Promise.resolve("/Users/plugins/temp/remote-plugin");
			}

			if (channel === "plugin:cancel-install") {
				cancelInstall(...args);
			}

			return Promise.resolve();
		});
		const onClose = jest.fn();

		const { getByTestId } = render(
			<PluginManagerProvider manager={new PluginManager()} services={[]}>
				<InstallPlugin
					profile={profile}
					repositoryURL="https://github.com/my-plugin"
					isOpen={true}
					plugin={{ id: "remote-plugin", permissions: ["PROFILE"], title: "Remote Plugin" }}
					onClose={onClose}
				/>
			</PluginManagerProvider>,
		);

		fireEvent.click(getByTestId("modal__close-btn"));

		expect(onClose).toHaveBeenCalled();

		const downloadPlugin = async () => {
			fireEvent.click(getByTestId("InstallPlugin__download-button"));

			await waitFor(() => expect(getByTestId("InstallPlugin__step--second")).toBeInTheDocument());

			expect(invokeSpy).toHaveBeenLastCalledWith("plugin:download", {
				name: "remote-plugin",
				url: "https://github.com/my-plugin/archive/master.zip",
			});

			await waitFor(() => expect(getByTestId("InstallPlugin__step--third")).toBeInTheDocument());
		};

		await downloadPlugin();

		// Cancel: do not go ahead with installation

		fireEvent.click(getByTestId("InstallPlugin__cancel-button"));

		await waitFor(() =>
			expect(cancelInstall).toHaveBeenCalledWith({
				savedPath: "/Users/plugins/temp/remote-plugin",
			}),
		);

		expect(cancelInstall).toHaveBeenCalledTimes(1);

		await downloadPlugin();

		// Close: do not go ahead with installation

		fireEvent.click(getByTestId("modal__close-btn"));

		await waitFor(() =>
			expect(cancelInstall).toHaveBeenCalledWith({
				savedPath: "/Users/plugins/temp/remote-plugin",
			}),
		);

		expect(cancelInstall).toHaveBeenCalledTimes(2);

		// Happy path: proceed with installation

		await downloadPlugin();

		fireEvent.click(getByTestId("InstallPlugin__install-button"));

		expect(invokeSpy).toHaveBeenLastCalledWith("plugin:install", {
			name: "remote-plugin",
			profileId: profile.id(),
			savedPath: "/Users/plugins/temp/remote-plugin",
		});

		await waitFor(() => expect(onClose).toHaveBeenCalled());
	});
});
