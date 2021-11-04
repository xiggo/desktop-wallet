import { ProfileRoutes } from "domains/profile/routing";

describe("Profile routing", () => {
	it("should return profile route object", () => {
		expect(ProfileRoutes[0].path).toBe("/profiles/create");
		expect(ProfileRoutes[0].exact).toBe(true);
	});
});
