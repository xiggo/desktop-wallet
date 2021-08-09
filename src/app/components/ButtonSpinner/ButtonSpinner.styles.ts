import { FlattenSimpleInterpolation } from "styled-components";
import tw, { css, TwStyle } from "twin.macro";
import { ButtonVariant } from "types";
import { shouldUseDarkColors } from "utils/electron-utils";

const baseStyle = [tw`w-6 h-6 border border-4 rounded-full animate-spin`];

const variantColors: {
	[key in ButtonVariant]?: string;
} = {
	danger: "danger-400",
	primary: "white",
	secondary: "primary-600",
};

const getColor = (variant: ButtonVariant): Array<FlattenSimpleInterpolation | TwStyle> => {
	const color = variantColors[variant] || "primary-500";

	const styles: Array<FlattenSimpleInterpolation | TwStyle> = [];

	switch (variant) {
		case "danger": {
			styles.push(tw`border-theme-danger-200 dark:border-theme-danger-500`);

			break;
		}
		case "primary": {
			styles.push(tw`border-theme-primary-700`);

			break;
		}
		case "secondary": {
			styles.push(tw`border-white dark:border-theme-secondary-900`);

			break;
		}
		default: {
			styles.push(tw`border-theme-secondary-200`);
		}
	}

	if (variant === "danger" && shouldUseDarkColors()) {
		styles.push(
			css`
				border-left-color: var(--theme-color-white) !important;
			`,
		);
	} else {
		styles.push(
			css`
				border-left-color: var(--theme-color-${color}) !important;
			`,
		);
	}

	return styles;
};

export const getStyles = ({ variant }: { variant?: ButtonVariant }) => [...baseStyle, ...getColor(variant!)];
