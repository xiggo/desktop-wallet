import cn from "classnames";
import React from "react";

import { AmountProperties } from "./Amount.contracts";
import { formatCrypto, formatWithSign } from "./Amount.helpers";

const AmountCrypto: React.FC<AmountProperties> = ({
	className,
	isNegative = false,
	locale,
	showSign,
	showTicker = true,
	ticker,
	value,
}: AmountProperties) => {
	let formattedAmount = formatCrypto({ locale, ticker, value });

	if (!showTicker) {
		formattedAmount = formattedAmount.split(" ").slice(0, -1).join(" ");
	}

	if (showSign) {
		formattedAmount = formatWithSign(formattedAmount, isNegative);
	}

	return (
		<span data-testid="AmountCrypto" className={cn("whitespace-nowrap", className)}>
			{formattedAmount}
		</span>
	);
};

export { AmountCrypto };
