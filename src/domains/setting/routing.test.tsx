import { SettingRoutes } from "domains/setting/routing";

describe("Setting routing", () => {
	it("should return setting route object", () => {
		expect(SettingRoutes[0].path).toBe("/profiles/:profileId/settings/general");
		expect(SettingRoutes[0].exact).toBe(true);

		expect(SettingRoutes[1].path).toBe("/profiles/:profileId/settings/password");
		expect(SettingRoutes[1].exact).toBe(true);

		expect(SettingRoutes[2].path).toBe("/profiles/:profileId/settings/export");
		expect(SettingRoutes[2].exact).toBe(true);

		expect(SettingRoutes[3].path).toBe("/profiles/:profileId/settings/appearance");
		expect(SettingRoutes[3].exact).toBe(true);

		expect(SettingRoutes[4].path).toBe("/profiles/:profileId/settings");
		expect(SettingRoutes[4].exact).toBe(true);
	});
});
