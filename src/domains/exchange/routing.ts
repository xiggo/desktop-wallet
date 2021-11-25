import { ExchangeView } from "@/domains/exchange/pages/ExchangeView";

import { Exchange } from "./pages";

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
