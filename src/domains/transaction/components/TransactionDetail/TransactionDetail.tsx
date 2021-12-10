import cn from "classnames";
import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./TransactionDetail.styles";

export type TransactionDetailProperties = {
	children?: React.ReactNode;
	label?: string | React.ReactNode;
	extra?: React.ReactNode;
	border?: boolean;
	borderPosition?: "top" | "bottom" | "both";
	padding?: boolean;
	paddingPosition?: "top" | "bottom" | "both" | "none";
	className?: string;
} & React.HTMLAttributes<any>;

const TransactionDetailStyled = styled.div<TransactionDetailProperties>(getStyles);

export const TransactionDetail = React.forwardRef<HTMLDivElement, TransactionDetailProperties>(
	(
		{
			border = true,
			borderPosition = "top",
			children,
			className,
			extra,
			label,
			padding = true,
			paddingPosition,
			...properties
		}: TransactionDetailProperties,
		reference,
	) => (
		<TransactionDetailStyled
			data-testid="TransactionDetail"
			border={border}
			borderPosition={borderPosition}
			padding={padding}
			paddingPosition={paddingPosition}
			className={cn("no-ligatures", className)}
			ref={reference}
			{...properties}
		>
			<div className="flex-1 space-y-2 w-40 whitespace-nowrap">
				{label && (
					<div className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700 no-ligatures">
						{label}
					</div>
				)}

				<div className="flex items-center font-semibold">{children}</div>
			</div>

			{extra ? extra : <></>}
		</TransactionDetailStyled>
	),
);

TransactionDetail.displayName = "TransactionDetail";
