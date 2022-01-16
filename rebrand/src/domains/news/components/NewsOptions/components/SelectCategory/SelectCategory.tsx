import React from "react";
import tw, { styled } from "twin.macro";

import { SelectCategoryProperties } from "./SelectCategory.contracts";

const Input = styled.input`
	${tw`sr-only`}
`;

const CustomButton = styled.div`
	${tw`p-2 px-4 font-semibold text-center transition-colors duration-200 border-2 rounded-md border-theme-primary-100 dark:border-theme-secondary-800 text-theme-primary-200 dark:text-theme-secondary-800`}
	${Input}:checked + & {
		${tw`border-theme-success-600 text-theme-success-600`}
	}
`;

export const SelectCategory = React.forwardRef<HTMLInputElement, SelectCategoryProperties>(
	(
		{
			children,
			type = "checkbox",
			name,
			value,
			checked,
			defaultChecked,
			disabled,
			onChange,
			...properties
		}: SelectCategoryProperties,
		reference,
	) => (
		<label htmlFor={name} tw="cursor-pointer" {...properties}>
			<Input
				data-testid={name ? `SelectCategory__${name}` : undefined}
				ref={reference}
				type={type}
				name={name}
				value={value}
				checked={checked}
				defaultChecked={defaultChecked}
				disabled={disabled}
				onChange={onChange}
			/>
			<CustomButton>{children}</CustomButton>
		</label>
	),
);

SelectCategory.displayName = "SelectCategory";
