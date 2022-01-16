import { WalletRoutes } from "@/domains/wallet/routing";

describe("Wallet routing", () => {
	it("should have 3 routes", () => {
		expect(WalletRoutes).toHaveLength(4);
	});

	it("should have a page to create a wallet", () => {
		expect(WalletRoutes[0].component.name).toBe("CreateWallet");
		expect(WalletRoutes[0].exact).toBe(true);
		expect(WalletRoutes[0].path).toBe("/profiles/:profileId/wallets/create");
	});

	it("should have a page to import a wallet", () => {
		expect(WalletRoutes[1].component.name).toBe("ImportWallet");
		expect(WalletRoutes[1].exact).toBe(true);
		expect(WalletRoutes[1].path).toBe("/profiles/:profileId/wallets/import");
	});

	it("should have a detail page", () => {
		expect(WalletRoutes[2].component.name).toBe("WalletDetails");
		expect(WalletRoutes[2].exact).toBe(true);
		expect(WalletRoutes[2].path).toBe("/profiles/:profileId/wallets/:walletId");
	});
});
