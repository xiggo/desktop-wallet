import { Networks } from "@payvo/sdk";
import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import cn from "classnames";
import { CoinNetworkExtended } from "domains/network/data";
import React, { memo } from "react";
import { Size } from "types";

type Network = Networks.Network & { extra?: CoinNetworkExtended };

interface Properties {
	disabled?: boolean;
	network?: Network;
	as?: React.ElementType;
	className?: string;
	iconClassName?: string;
	iconSize?: Size;
	shadowColor?: string;
	onClick?: () => void;
}

export const NetworkOption = memo(
	({ disabled, network, iconSize = "lg", iconClassName, onClick, ...properties }: Properties) => {
		if (!network?.extra) {
			return <></>;
		}

		const iconColorClass = network.isLive() ? "text-theme-secondary-700" : "text-theme-primary-300";

		const handleClick = () => {
			if (!disabled) {
				onClick?.();
			}
		};

		return (
			<li
				className={cn("inline-block cursor-pointer h-21", { "cursor-not-allowed": disabled })}
				data-testid="SelectNetwork__NetworkIcon--container"
				onClick={handleClick}
			>
				<Tooltip content={network.extra.displayName}>
					<div
						className={`w-full h-full flex justify-center items-center border-2 rounded-xl ${
							iconClassName ||
							`border-theme-primary-100 dark:border-theme-secondary-800 ${iconColorClass}`
						}`}
						aria-label={network.extra.displayName}
						data-testid={`NetworkIcon-${network?.coin()}-${network?.id()}`}
						{...properties}
					>
						<Icon data-testid="NetworkIcon__icon" name={network.extra.iconName} size={iconSize} />
					</div>
				</Tooltip>
			</li>
		);
	},
);

NetworkOption.displayName = "NetworkOption";
