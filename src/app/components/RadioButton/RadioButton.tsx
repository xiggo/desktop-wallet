import React from "react";
import { styled } from "twin.macro";
import { Color } from "types";

import { getStyles } from "./RadioButton.styles";

type RadioButtonProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const RadioButton = styled.input.attrs<RadioButtonProperties>(({ color }) => ({
	color: color ?? "success",
	type: "radio",
}))<RadioButtonProperties>(getStyles);
