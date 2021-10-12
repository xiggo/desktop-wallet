import { Networks } from "@payvo/sdk";
import { useEnvironmentContext } from "app/contexts";
import { useCallback, useMemo } from "react";

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
			networks.map((network) => ({
				label: `${network.coinName()} ${network.name()}`,
				value: network.id(),
			})),
		[networks],
	);

	const networkById = useCallback((id?: string) => env.availableNetworks().find((network) => network.id() === id), [
		env,
	]);

	return {
		networkById,
		networkOptions,
	};
};
