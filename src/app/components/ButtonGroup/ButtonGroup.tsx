import { Tooltip } from "app/components/Tooltip";
import React from "react";
import tw, { css, styled } from "twin.macro";

export const ButtonGroup = ({ children }: React.PropsWithChildren<{}>) => (
	<div data-testid="ButtonGroup" role="radiogroup" className="inline-flex items-center space-x-3 w-full">
		{children}
	</div>
);

type ButtonGroupOptionVariant = "default" | "modern";

const ButtonGroupOptionStyled = styled.button<{ variant: ButtonGroupOptionVariant }>(({ variant }) => {
	let styles = [
		tw`flex items-center justify-center w-full h-full`,
		tw`p-3 font-semibold text-theme-secondary-700`,
		tw`border-2 border-theme-primary-100`,
		tw`dark:(border-theme-secondary-800 text-theme-secondary-200)`,
		tw`focus:(outline-none ring-2 ring-theme-primary-400)`,
		tw`disabled:(
			border border-theme-secondary-300 text-theme-secondary-500 cursor-not-allowed
			dark:(text-theme-secondary-700 border-theme-secondary-700)
		)`,
		css`
			&[aria-checked="true"] {
				${tw`text-theme-text border-theme-success-600 bg-theme-success-100 dark:bg-theme-success-900 cursor-default`}
			}
		`,
	];

	if (variant === "default") {
		styles = [...styles, tw`rounded transition-colors duration-300`];
	}

	if (variant === "modern") {
		styles = [
			...styles,
			tw`h-12 rounded-xl`,
			css`
				&:hover:not([aria-checked="true"]) {
					${tw`border-transparent shadow-2xl`}
				}
			`,
		];
	}

	return styles;
});

interface ButtonGroupOptionProperties {
	children: React.ReactNode;
	disabled?: boolean;
	isSelected: (value: string | number) => boolean;
	setSelectedValue: (value: string | number) => void;
	tooltipContent?: string;
	value: string | number;
	variant?: ButtonGroupOptionVariant;
}

export const ButtonGroupOption = ({
	children,
	disabled,
	isSelected,
	setSelectedValue,
	tooltipContent,
	value,
	variant = "default",
}: ButtonGroupOptionProperties) => {
	/* istanbul ignore next */
	const label = tooltipContent ?? `${value ?? ""}`;

	const render = () => (
		<ButtonGroupOptionStyled
			aria-checked={isSelected(value)}
			aria-label={label}
			data-testid="ButtonGroupOption"
			disabled={disabled}
			onClick={() => setSelectedValue(value)}
			role="radio"
			type="button"
			variant={variant}
		>
			{children}
		</ButtonGroupOptionStyled>
	);

	if (tooltipContent) {
		return <Tooltip content={tooltipContent}>{render()}</Tooltip>;
	}

	return render();
};
