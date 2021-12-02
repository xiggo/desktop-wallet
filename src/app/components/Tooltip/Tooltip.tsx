import Tippy, { TippyProps } from "@tippyjs/react";
import cn from "classnames";
import React from "react";

import { useTheme } from "@/app/hooks";
import { Size } from "@/types";

import { getStyles } from "./Tooltip.styles";

export type TooltipProperties = {
	size?: Size;
} & TippyProps;

export const Tooltip = ({ size, theme, ...properties }: TooltipProperties) => {
	const themeOptions = useTheme();
	if (!properties.content) {
		return <>{properties.children}</>;
	}
	return (
		<Tippy
			maxWidth={600}
			theme={theme || themeOptions.theme}
			{...properties}
			className={cn(getStyles(size), properties.className)}
		/>
	);
};
