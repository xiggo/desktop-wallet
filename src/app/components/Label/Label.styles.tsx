import tw from "twin.macro";
import { Size } from "types";

const baseStyle = tw`inline-block font-semibold overflow-hidden`;

const getColors = (name: string, variant?: string): any => {
	if (variant === "solid") {
		switch (name) {
			case "primary":
				return tw`text-theme-primary-500 border-theme-primary-100 bg-theme-primary-100`;
			case "success":
				return tw`text-theme-success-600 border-theme-success-200 bg-theme-success-200`;
			case "danger":
				return tw`text-theme-danger-500 border-theme-danger-100 bg-theme-danger-100`;
			default:
				// warning
				return tw`text-theme-warning-700 border-theme-warning-100 bg-theme-warning-100`;
		}
	}

	switch (name) {
		case "primary":
			return tw`text-theme-primary-500 border-theme-primary-100 dark:border-theme-primary-500`;
		case "success":
			return tw`text-theme-success-600 border-theme-success-200 dark:border-theme-success-600`;
		case "danger":
			return tw`text-theme-danger-400 border-theme-danger-100 dark:border-theme-danger-400`;
		case "neutral":
			return tw`text-theme-secondary-900 border-theme-secondary-200 dark:text-theme-secondary-600 dark:border-theme-secondary-600`;
		default:
			// warning
			return tw`text-theme-warning-700 border-theme-danger-100 dark:border-theme-warning-700`;
	}
};

const getSize = (size?: Size): any => {
	switch (size) {
		case "lg":
			return tw`text-lg`;
		default:
			return tw`text-base`;
	}
};

const getBorder = (noBorder?: boolean): any => {
	if (!noBorder) {
		return tw`px-1 border-2 rounded`;
	}
};

export const getStyles = ({
	color,
	size,
	variant,
	noBorder,
}: {
	color?: string;
	size?: Size;
	variant?: string;
	noBorder?: boolean;
}) => [baseStyle, getBorder(noBorder), getColors(color!, variant), getSize(size)];
