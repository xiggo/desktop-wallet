import React from "react";
import { FlattenSimpleInterpolation } from "styled-components";
import tw, { css, TwStyle } from "twin.macro";

type TableRowFunction = (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;

const baseStyle = tw`transition-colors duration-100`;

const getCursorStyles = (onClick?: TableRowFunction) => onClick && tw`cursor-pointer`;

const getBorderStyles = (border?: boolean, dotted?: boolean) => {
	if (!border) {
		return;
	}

	return [
		tw`border-b last:border-b-0 border-theme-secondary-300 dark:border-theme-secondary-800`,
		dotted ? tw`border-dotted` : tw`border-dashed`,
	];
};

const getHoverStyles = (isSelected?: boolean): FlattenSimpleInterpolation =>
	css`
		&:hover td > div {
			${isSelected
				? tw`bg-theme-success-100 dark:bg-theme-success-900`
				: tw`bg-theme-secondary-100 dark:bg-black`}
		}
	`;

export interface TableRowStyleProperties {
	border?: boolean;
	dotted?: boolean;
	onClick?: TableRowFunction;
	isSelected?: boolean;
}

export const getStyles = ({ onClick, border, dotted, isSelected }: TableRowStyleProperties) => {
	const styles: Array<FlattenSimpleInterpolation | TwStyle | TwStyle[] | undefined> = [
		baseStyle,
		getBorderStyles(border, dotted),
		getCursorStyles(onClick),
	];

	if (onClick) {
		styles.push(getHoverStyles(isSelected));
	}

	return styles;
};
