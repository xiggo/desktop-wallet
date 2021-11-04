import { TransactionRoutes } from "domains/transaction/routing";

describe("Transaction routing", () => {
	it("should return transaction route object", () => {
		expect(TransactionRoutes[0].path).toBe(
			"/profiles/:profileId/wallets/:walletId/send-registration/:registrationType",
		);
		expect(TransactionRoutes[0].exact).toBe(true);

		expect(TransactionRoutes[1].path).toBe("/profiles/:profileId/wallets/:walletId/send-delegate-resignation");
		expect(TransactionRoutes[1].exact).toBe(true);

		expect(TransactionRoutes[2].path).toBe("/profiles/:profileId/wallets/:walletId/send-transfer");
		expect(TransactionRoutes[2].exact).toBe(true);

		expect(TransactionRoutes[3].path).toBe("/profiles/:profileId/send-transfer");
		expect(TransactionRoutes[4].exact).toBe(true);

		expect(TransactionRoutes[4].path).toBe("/profiles/:profileId/wallets/:walletId/send-ipfs");
		expect(TransactionRoutes[4].exact).toBe(true);

		expect(TransactionRoutes[5].path).toBe("/profiles/:profileId/wallets/:walletId/send-vote");
		expect(TransactionRoutes[5].exact).toBe(true);
	});
});
