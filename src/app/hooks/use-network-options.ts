import { Networks } from "@payvo/sdk";
import { useEnvironmentContext } from "app/contexts";
import { useCallback, useMemo } from "react";

export const useNetworkOptions = (useTestNetworks?: boolean) => {
	const { env } = useEnvironmentContext();

	const networks: Networks.Network[] = useMemo(() => {
		let networks = env.availableNetworks();

		if (!useTestNetworks) {
			networks = networks.filter((network: Networks.Network) => network.isLive());
		}

		return networks;
	}, [env, useTestNetworks]);

	const networkOptions = useMemo(
		() =>
			networks.map((network) => ({
				label: `${network.coinName()} ${network.name()}`,
				value: network.id(),
			})),
		[networks],
	);

	const networkById = useCallback((id?: string) => networks.find((network) => network.id() === id), [networks]);

	return {
		networkById,
		networkOptions,
	};
};
