import { Contracts } from "@payvo/sdk-profiles";
import { act as actHook, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { usePluginUpdateQueue } from "./use-plugin-update-queue";
import { EnvironmentProvider } from "@/app/contexts";
import { PluginManagerProvider } from "@/plugins/context/PluginManagerProvider";
import { env, getDefaultProfileId, pluginManager } from "@/utils/testing-library";

describe("Plugin Update Queue", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should work properly", async () => {
		const ids = [{ id: "plugin-1" }, { id: "plugin-2" }, { id: "plugin-3" }];

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<PluginManagerProvider services={[]} manager={pluginManager}>
					{children}
				</PluginManagerProvider>
			</EnvironmentProvider>
		);

		const { result, waitForValueToChange } = renderHook(() => usePluginUpdateQueue(profile), { wrapper });

		actHook(() => {
			result.current.startUpdate(ids);
		});

		expect(result.current.hasInUpdateQueue("plugin-3")).toBe(true);
		expect(result.current.hasUpdateComplete("plugin-3")).toBe(false);
		expect(result.current.isUpdating).toBe(true);

		await waitForValueToChange(() => result.current.isUpdateCompleted);

		expect(result.current.isUpdateCompleted).toBe(true);
		expect(result.current.hasUpdateComplete("plugin-3")).toBe(true);

		expect(result.current.isUpdating).toBe(false);
		expect(result.current.hasInUpdateQueue("plugin-3")).toBe(false);
	});
});
