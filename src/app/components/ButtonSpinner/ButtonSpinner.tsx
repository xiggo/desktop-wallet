import { styled } from "twin.macro";
import { ButtonVariant } from "types";

import { getStyles } from "./ButtonSpinner.styles";

interface ButtonSpinner {
	variant: ButtonVariant | undefined;
}

export const ButtonSpinner = styled.div<ButtonSpinner>(getStyles);

ButtonSpinner.defaultProps = {
	variant: "primary",
};
