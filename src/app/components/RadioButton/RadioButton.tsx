import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./RadioButton.styles";
import { Color } from "@/types";

type RadioButtonProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const RadioButton = styled.input.attrs<RadioButtonProperties>(({ color }) => ({
	color: color ?? "success",
	type: "radio",
}))<RadioButtonProperties>(getStyles);
