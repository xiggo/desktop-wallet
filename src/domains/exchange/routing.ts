import { Exchange } from "./pages";
import { ExchangeView } from "@/domains/exchange/pages/ExchangeView";

export const ExchangeRoutes = [
	{
		component: ExchangeView,
		exact: true,
		path: "/profiles/:profileId/exchange/view",
	},
	{
		component: Exchange,
		exact: true,
		path: "/profiles/:profileId/exchange",
	},
];
