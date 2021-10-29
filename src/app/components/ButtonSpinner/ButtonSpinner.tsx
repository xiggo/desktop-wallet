import { styled } from "twin.macro";
import { ButtonVariant } from "types";

import { getStyles } from "./ButtonSpinner.styles";

interface ButtonSpinnerType {
	variant: ButtonVariant | undefined;
}

export const ButtonSpinner = styled.div.attrs<ButtonSpinnerType>(({ variant }) => ({
	variant: variant ?? "primary",
}))<ButtonSpinnerType>(getStyles);
