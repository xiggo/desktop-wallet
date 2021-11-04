import { VoteRoutes } from "domains/vote/routing";

describe("Vote routing", () => {
	it("should return vote route object", () => {
		expect(VoteRoutes[0].path).toBe("/profiles/:profileId/votes");
		expect(VoteRoutes[0].exact).toBe(true);

		expect(VoteRoutes[1].path).toBe("/profiles/:profileId/wallets/:walletId/votes");
		expect(VoteRoutes[1].exact).toBe(true);
	});
});
