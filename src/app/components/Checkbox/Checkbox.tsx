import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./Checkbox.styles";
import { Color } from "@/types";

type CheckboxProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const Checkbox = styled.input.attrs<CheckboxProperties>(({ color }) => ({
	color: color ?? "success",
	type: "checkbox",
}))<CheckboxProperties>(getStyles);
