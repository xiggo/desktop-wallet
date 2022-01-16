import { CreateWallet, ImportWallet, WalletDetails } from "./pages";
import { WalletGroupPage } from "@/domains/wallet/components/WalletGroupPage";

export const WalletRoutes = [
	{
		component: CreateWallet,
		exact: true,
		path: "/profiles/:profileId/wallets/create",
	},
	{
		component: ImportWallet,
		exact: true,
		path: "/profiles/:profileId/wallets/import",
	},
	{
		component: WalletDetails,
		exact: true,
		path: "/profiles/:profileId/wallets/:walletId",
	},
	{
		component: WalletGroupPage,
		exact: true,
		path: "/profiles/:profileId/network/:networkId",
	},
];
