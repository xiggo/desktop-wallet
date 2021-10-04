// Assets
import { SvgCollection } from "app/assets/svg";
import React from "react";
import styled from "styled-components";
import { Size } from "types";

type Properties = {
	name: string;
	size?: Size;
	as?: React.ElementType;
	fallback?: React.ReactNode;
} & Omit<React.HTMLProps<any>, "size" | "width" | "height">;

interface WrapperProperties {
	width: number;
	height: number;
}

const Wrapper = styled.div(({ width, height }: WrapperProperties) => ({
	svg: {
		height,
		width,
	},
}));

export const Icon = ({ name, fallback, size, ...properties }: Properties) => {
	const Svg = SvgCollection[name];

	const getDimensions = (size?: Size): number[] => {
		const sizeMap: {
			[key: string]: number[];
		} = {
			lg: [20, 20],
			md: [16, 16],
			sm: [10, 10],
			xl: [40, 40],
		};

		return sizeMap[size || "md"];
	};

	const [width, height] = getDimensions(size);

	return (
		<Wrapper width={width} height={height} {...properties}>
			{Svg ? <Svg /> : fallback}
		</Wrapper>
	);
};
