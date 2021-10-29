import { styled } from "twin.macro";
import { Color, Size } from "types";

import { getStyles } from "./Spinner.styles";

interface SpinnerType {
	color?: Color;
	size?: Size;
}

export const Spinner = styled.div.attrs<SpinnerType>(({ color }) => ({ color: color ?? "info" }))<SpinnerType>(
	getStyles,
);
