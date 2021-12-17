import cn from "classnames";
import React, { useLayoutEffect, useState } from "react";

import { useResizeDetector } from "react-resize-detector";
import { TruncateMiddleDynamicProperties } from "@/app/components/TruncateMiddleDynamic/TruncateMiddleDynamic.contracts";
import { Tooltip } from "@/app/components/Tooltip";

export const getTruncatedValue = (referenceElement: HTMLElement, elementWidth: number, value: string, offset = 0) => {
	const hasOverflow = (element: HTMLElement) => element.getBoundingClientRect().width > elementWidth - offset;

	const getTruncatedValue = (mid: number) => {
		const prefix = value.slice(0, Math.max(0, mid));
		const suffix = value.slice(-mid);

		return `${prefix}…${suffix}`;
	};

	const element = document.createElement("span");
	element.innerHTML = value;
	element.classList.add("fixed", "invisible", "w-auto", "whitespace-nowrap");
	referenceElement.append(element);

	if (!hasOverflow(element)) {
		element.remove();
		return value;
	}

	let temporary = value;
	let mid = Math.floor(value.length / 2) - 1;
	do {
		temporary = getTruncatedValue(mid);
		mid--;

		element.innerHTML = temporary;
	} while (mid && hasOverflow(element));
	element.remove();

	return temporary;
};

export const TruncateMiddleDynamic: React.VFC<TruncateMiddleDynamicProperties> = ({
	value,
	offset = 0,
	className,
	tooltipDarkTheme,
	parentRef,
	...properties
}) => {
	const [truncatedValue, setTruncatedValue] = useState(value);

	const { width, ref } = useResizeDetector<HTMLElement>({ handleHeight: false, targetRef: parentRef ?? undefined });
	const spanReference = parentRef ? undefined : ref;

	useLayoutEffect(() => {
		if (!ref.current || !width) {
			return;
		}
		setTruncatedValue(getTruncatedValue(ref.current, Number(width), value, offset));
	}, [ref, value, offset, width]);

	return (
		<Tooltip content={value} disabled={truncatedValue === value} theme={tooltipDarkTheme ? "dark" : undefined}>
			<span ref={spanReference} className={cn("flex-1 inline-flex overflow-hidden", className)} {...properties}>
				{truncatedValue}
			</span>
		</Tooltip>
	);
};
