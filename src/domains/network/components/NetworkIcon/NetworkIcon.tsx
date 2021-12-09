import { Networks } from "@payvo/sdk";
import cn from "classnames";
import React from "react";

import { Circle, CircleProperties } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";

interface NetworkIconProperties {
	network?: Networks.Network;
	as?: React.ElementType;
	size: Size;
	className?: string;
	shadowClassName?: string;
	iconSize?: Size;
	showTooltip?: boolean;
	tooltipDarkTheme?: boolean;
	noShadow?: boolean;
	isCompact?: boolean;
}

const Placeholder = (properties: CircleProperties) => (
	<Circle
		data-testid="NetworkIcon__placeholder"
		className="border-theme-secondary-200 text-theme-secondary-500 dark:border-theme-secondary-700"
		{...properties}
	/>
);

export const NetworkIcon: React.VFC<NetworkIconProperties> = ({
	network,
	iconSize = "lg",
	className,
	showTooltip = true,
	tooltipDarkTheme,
	isCompact = false,
	...properties
}) => {
	if (!network) {
		return <Placeholder className={className} {...properties} />;
	}

	const getClassName = () => {
		if (className) {
			return className;
		}

		if (network.isLive()) {
			return "text-theme-primary-600 border-theme-primary-100 dark:border-theme-primary-600";
		}

		return "text-theme-secondary-700 border-theme-secondary-300 dark:border-theme-secondary-700";
	};

	const renderIcon = () => {
		const tickerIcon = <Icon data-testid="NetworkIcon__icon" name={network.ticker()} size={iconSize} />;

		if (isCompact) {
			return (
				<div
					aria-label={network.displayName()}
					data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
					className={cn("w-5 h-5 inline-flex items-center", getClassName())}
				>
					{tickerIcon}
				</div>
			);
		}

		return (
			<Circle
				aria-label={network.displayName()}
				data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
				className={getClassName()}
				{...properties}
			>
				{tickerIcon}
			</Circle>
		);
	};

	return (
		<Tooltip content={network.displayName()} disabled={!showTooltip} theme={tooltipDarkTheme ? "dark" : undefined}>
			{renderIcon()}
		</Tooltip>
	);
};
