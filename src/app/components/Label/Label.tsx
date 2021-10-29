import { styled } from "twin.macro";
import { Size } from "types";

import { getStyles } from "./Label.styles";

interface LabelProperties {
	color?: "primary" | "success" | "danger" | "warning" | "neutral";
	size?: Size;
	variant?: "solid";
	noBorder?: boolean;
}

export const Label = styled.div.attrs<LabelProperties>(({ color }) => ({ color: color ?? "primary" }))<LabelProperties>(
	getStyles,
);
