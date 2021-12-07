import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./Button.styles";
import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { Icon } from "@/app/components/Icon";
import { ButtonVariant, Size } from "@/types";

type ButtonProperties = {
	variant?: ButtonVariant;
	size?: Size;
	isLoading?: boolean;
	icon?: string;
	iconSize?: Size;
	iconPosition?: "left" | "right";
} & React.ButtonHTMLAttributes<any>;

const StyledButton = styled.button<ButtonProperties>(getStyles);

export const OriginalButton = React.forwardRef<HTMLButtonElement, ButtonProperties>(
	(
		{
			variant = "primary",
			children,
			icon,
			isLoading,
			iconSize,
			iconPosition = "left",
			type = "button",
			...properties
		}: ButtonProperties,
		reference,
	) => {
		const renderContent = () => {
			if (isLoading) {
				return (
					<div className="flex items-center">
						<span className="flex items-center invisible space-x-2">
							{icon && <Icon name={icon} size={iconSize} />}
							{children}
						</span>

						<div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
							<ButtonSpinner variant={variant} />
						</div>
					</div>
				);
			}

			return (
				<>
					{icon && iconPosition === "left" && <Icon name={icon} size={iconSize} />}
					{children}
					{icon && iconPosition === "right" && <Icon name={icon} size={iconSize} />}
				</>
			);
		};

		return (
			<StyledButton type={type} variant={variant} ref={reference} {...properties}>
				<div className="flex items-center space-x-2">{renderContent()}</div>
			</StyledButton>
		);
	},
);

OriginalButton.displayName = "Button";
