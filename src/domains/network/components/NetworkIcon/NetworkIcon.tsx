import { Networks } from "@payvo/sdk";
import { Circle, CircleProps } from "app/components/Circle";
import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import React from "react";
import { Size } from "types";

interface Properties {
	network?: Networks.Network;
	as?: React.ElementType;
	size?: Size;
	className?: string;
	shadowClassName?: string;
	iconSize?: Size;
	showTooltip?: boolean;
	noShadow?: boolean;
}

const Placeholder = (properties: CircleProps) => (
	<Circle
		data-testid="NetworkIcon__placeholder"
		className="border-theme-secondary-200 text-theme-secondary-500 dark:border-theme-secondary-700"
		{...properties}
	/>
);

export const NetworkIcon = ({ network, iconSize, className, showTooltip, ...properties }: Properties) => {
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

	return (
		<Tooltip content={network.displayName()} disabled={!showTooltip}>
			<Circle
				aria-label={network.displayName()}
				data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
				className={getClassName()}
				{...properties}
			>
				<Icon data-testid="NetworkIcon__icon" name={network.ticker()} size={iconSize} />
			</Circle>
		</Tooltip>
	);
};

NetworkIcon.defaultProps = {
	iconSize: "lg",
	showTooltip: true,
};
