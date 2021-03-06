import React, { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import {
	GRAPH_MIN_VALUE,
	GraphDataPoint,
	UseGraphDataHook,
	UseGraphTooltipHook,
	UseGraphWidthHook,
} from "./Graphs.contracts";

const useGraphData: UseGraphDataHook = (graphType, addToOtherGroup) => {
	const isTooSmallToBeVisible = useCallback(
		(value: number, size: number) => value * size < GRAPH_MIN_VALUE[graphType],
		[graphType],
	);

	const group = useCallback(
		(data: GraphDataPoint[], size: number) => {
			// Skip grouping data if the sum function is not specified.
			if (!addToOtherGroup) {
				return data;
			}

			const result: GraphDataPoint[] = [];

			let otherGroup: GraphDataPoint | undefined;

			let itemCount = 0;

			for (const entry of data) {
				itemCount++;

				if (isTooSmallToBeVisible(entry.value, size) || itemCount > 6) {
					otherGroup = addToOtherGroup(otherGroup, entry);
					continue;
				}

				result.push(entry);
			}

			if (otherGroup !== undefined && !isTooSmallToBeVisible(otherGroup.value, size)) {
				result.push(otherGroup);
			}

			return result;
		},
		[addToOtherGroup, isTooSmallToBeVisible],
	);

	return { group };
};

const useGraphWidth: UseGraphWidthHook = () => {
	const reference = useRef<SVGSVGElement | null>(null);

	const [value, setValue] = useState(0);

	useEffect(() => {
		const setWidth = () => {
			setValue(reference.current?.clientWidth ?? 0);
		};

		setWidth();

		window.addEventListener("resize", setWidth);

		return () => {
			window.removeEventListener("resize", setWidth);
		};
	});

	return [reference, value];
};

const useGraphTooltip: UseGraphTooltipHook = (renderFunction, type) => {
	const timeout = useRef<number>();
	const tooltipReference = useRef<HTMLDivElement | null>(null);

	const [tooltipDataPoint, setTooltipDataPoint] = useState<GraphDataPoint | undefined>(undefined);

	const transformTooltip = useCallback(
		(event: MouseEvent<SVGElement>) => {
			const tooltipElement = tooltipReference.current as HTMLDivElement;
			const targetRect = (event.target as SVGElement).getBoundingClientRect();

			if (type === "line") {
				tooltipElement.style.left = `${event.pageX - Math.floor(tooltipElement.clientWidth / 2)}px`;
				tooltipElement.style.top = `${targetRect.top + document.documentElement.scrollTop - 48}px`;
			}

			if (type === "donut") {
				tooltipElement.style.left = `${event.pageX - targetRect.left - 32}px`;
				tooltipElement.style.top = `${
					event.pageY - targetRect.top - document.documentElement.scrollTop - 24
				}px`;
			}

			tooltipElement.classList.remove("hidden");
			tooltipElement.classList.remove("opacity-0");
			tooltipElement.classList.add("opacity-100");
		},
		[type],
	);

	const getMouseEventProperties = (dataPoint: GraphDataPoint) => ({
		onMouseEnter: (event: MouseEvent<SVGElement>) => {
			window.clearTimeout(timeout.current);

			setTooltipDataPoint(dataPoint);

			transformTooltip(event);
		},
		onMouseMove: (event: MouseEvent<SVGElement>) => {
			transformTooltip(event);
		},
		onMouseOut: () => {
			tooltipReference.current?.classList.add("opacity-0");
			tooltipReference.current?.classList.remove("opacity-100");

			timeout.current = window.setTimeout(() => {
				tooltipReference.current?.classList.add("hidden");
			}, 200);
		},
	});

	if (!renderFunction) {
		return {
			Tooltip: () => <></>,
			getMouseEventProperties: () => ({} as never),
		};
	}

	const Tooltip: React.VFC = () => (
		<div
			ref={tooltipReference}
			data-testid="TooltipContainer"
			className="absolute z-10 duration-200 transition-opacity opacity-0"
		>
			{!!tooltipDataPoint && renderFunction(tooltipDataPoint)}
		</div>
	);

	return { Tooltip, getMouseEventProperties };
};

export { useGraphData, useGraphTooltip, useGraphWidth };
