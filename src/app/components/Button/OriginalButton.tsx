import { Icon } from "app/components/Icon";
import { Spinner } from "app/components/Spinner";
import React from "react";
import { styled } from "twin.macro";
import { ButtonVariant, Size } from "types";

import { getStyles } from "./Button.styles";

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
	({ children, icon, isLoading, iconSize, iconPosition, ...properties }: ButtonProperties, reference) => {
		const renderContent = () => {
			if (isLoading) {
				return (
					<div className="flex relative items-center">
						<span className="flex invisible items-center space-x-2">
							{icon && <Icon name={icon} size={iconSize} />}
							{children}
						</span>

						<div className="absolute top-0 right-0 bottom-0 left-0">
							<Spinner size="sm" className="m-auto" />
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
			<StyledButton {...properties} ref={reference}>
				<div className="flex relative items-center space-x-2">{renderContent()}</div>
			</StyledButton>
		);
	},
);

OriginalButton.defaultProps = {
	iconPosition: "left",
	type: "button",
	variant: "primary",
};

OriginalButton.displayName = "Button";
