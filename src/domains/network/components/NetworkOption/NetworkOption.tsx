import { Networks } from "@payvo/sdk";
import cn from "classnames";
import React, { memo } from "react";

import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";

interface Properties {
	disabled?: boolean;
	network: Networks.Network;
	as?: React.ElementType;
	className?: string;
	iconClassName?: string;
	iconSize?: Size;
	shadowColor?: string;
	onClick?: () => void;
}

export const NetworkOption = memo(
	({ disabled, network, iconSize = "lg", iconClassName, onClick, ...properties }: Properties) => {
		const iconColorClass = network.isLive() ? "text-theme-primary-600" : "text-theme-secondary-700";

		const handleClick = () => {
			if (!disabled) {
				onClick?.();
			}
		};

		return (
			<li
				className={cn("inline-block cursor-pointer h-18", { "cursor-not-allowed": disabled })}
				data-testid="SelectNetwork__NetworkIcon--container"
				onClick={handleClick}
			>
				<Tooltip content={network.displayName()}>
					<div
						className={`w-full h-full flex justify-center items-center border-2 rounded-xl ${
							iconClassName ||
							`border-theme-primary-100 dark:border-theme-secondary-800 ${iconColorClass}`
						}`}
						aria-label={network.displayName()}
						data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
						{...properties}
					>
						<Icon data-testid="NetworkIcon__icon" name={network.ticker()} size={iconSize} />
					</div>
				</Tooltip>
			</li>
		);
	},
);

NetworkOption.displayName = "NetworkOption";
