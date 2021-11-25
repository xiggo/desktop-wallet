import { Networks } from "@payvo/sdk";
import { useCallback, useMemo } from "react";

import { useEnvironmentContext } from "@/app/contexts";

export const useNetworkOptions = (useTestNetworks?: boolean) => {
	const { env } = useEnvironmentContext();

	const networks: Networks.Network[] = useMemo(() => {
		const networks = env.availableNetworks();

		if (useTestNetworks) {
			return networks;
		}

		return networks.filter((network: Networks.Network) => network.isLive());
	}, [env, useTestNetworks]);

	const networkOptions = useMemo(
		() =>
			networks.map((network) => {
				let label = network.coinName();

				if (network.isTest()) {
					label = `${label} ${network.name()}`;
				}

				return {
					isTestNetwork: network.isTest(),
					label,
					value: network.id(),
				};
			}),
		[networks],
	);

	const networkById = useCallback(
		(id?: string) => env.availableNetworks().find((network) => network.id() === id),
		[env],
	);

	return {
		networkById,
		networkOptions,
	};
};
