import { DashboardRoutes } from "domains/dashboard/routing";

describe("Dashboard routing", () => {
	it("should return dashboard route object", () => {
		expect(DashboardRoutes[0].path).toBe("/profiles/:profileId/dashboard");
		expect(DashboardRoutes[0].exact).toBe(true);
	});
});
