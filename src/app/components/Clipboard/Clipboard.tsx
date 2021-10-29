import React from "react";

import { ClipboardButton, ClipboardButtonProperties } from "./ClipboardButton";
import { ClipboardIcon, ClipboardIconProperties } from "./ClipboardIcon";

export interface ClipboardCommonProperties {
	data: string | object;
	options?: Record<string, any>;
	children: React.ReactNode;
}

type ClipboardProperties = ClipboardIconProperties | ClipboardButtonProperties;

const defaultProps = {
	options: {},
};

export const Clipboard = ({ options = defaultProps.options, ...properties }: ClipboardProperties) => {
	if (!properties.children) {
		return null;
	}

	if (properties.variant === "icon") {
		return (
			<ClipboardIcon options={options} {...properties}>
				{properties.children}
			</ClipboardIcon>
		);
	}

	return (
		<ClipboardButton options={options} {...properties}>
			{properties.children}
		</ClipboardButton>
	);
};
