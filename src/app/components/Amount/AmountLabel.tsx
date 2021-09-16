import { Icon } from "app/components/Icon";
import { Label } from "app/components/Label";
import { Tooltip } from "app/components/Tooltip";
import cn from "classnames";
import React from "react";

import { Amount } from "./Amount";
import { AmountLabelProperties } from "./Amount.contracts";

export const AmountLabel: React.FC<AmountLabelProperties> = ({
	value,
	ticker,
	isNegative,
	hint,
}: AmountLabelProperties) => {
	let labelColor = "success";
	let hintClassName = "bg-theme-success-200 dark:bg-theme-success-600";

	if (isNegative) {
		labelColor = "danger";
		hintClassName = "bg-theme-danger-100 dark:bg-theme-danger-400";
	}

	if (value === 0) {
		labelColor = "neutral";
		hintClassName = "";
	}

	return (
		<Label color={labelColor as any}>
			<div className="flex space-x-1">
				{hint && (
					<Tooltip content={hint}>
						<div
							data-testid="AmountLabel__hint"
							className={cn("flex items-center -ml-1.5 px-2", hintClassName)}
						>
							<Icon name="HintSmall" size="sm" className="dark:text-white" />
						</div>
					</Tooltip>
				)}
				<Amount showSign={value !== 0} ticker={ticker} value={value} isNegative={isNegative} />
			</div>
		</Label>
	);
};
