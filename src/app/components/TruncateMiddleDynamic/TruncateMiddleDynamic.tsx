import cn from "classnames";
import React, { useCallback, useState } from "react";

import { Tooltip } from "@/app/components/Tooltip";

import { useTextTruncate } from "./use-text-truncate";

type Properties = {
	value: string;
	offset?: number;
	parentRef?: React.RefObject<HTMLElement>;
	tooltipDarkTheme?: boolean;
} & React.HTMLProps<any>;

export const TruncateMiddleDynamic = ({
	value,
	offset = 0,
	className,
	tooltipDarkTheme,
	parentRef,
	...properties
}: Properties) => {
	const [reference, setReference] = useState<HTMLElement | undefined>();

	const truncated = useTextTruncate(parentRef?.current || reference, value, offset);

	const callbackReference = useCallback((node) => {
		setReference(node);
	}, []);

	return (
		<Tooltip content={value} disabled={truncated === value} theme={tooltipDarkTheme ? "dark" : undefined}>
			<span ref={callbackReference} className={cn("inline-flex overflow-hidden", className)} {...properties}>
				{truncated}
			</span>
		</Tooltip>
	);
};
