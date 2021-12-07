import { styled } from "twin.macro";

import { getStyles } from "./ButtonSpinner.styles";
import { ButtonVariant } from "@/types";

interface ButtonSpinnerType {
	variant: ButtonVariant | undefined;
}

export const ButtonSpinner = styled.div.attrs<ButtonSpinnerType>(({ variant }) => ({
	variant: variant ?? "primary",
}))<ButtonSpinnerType>(getStyles);
