import React from "react";

import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";

type SelectProperties = { isInvalid?: boolean } & React.SelectHTMLAttributes<any>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProperties>(
	({ placeholder, children, defaultValue = "", ...properties }: SelectProperties, reference) => (
		<Input
			data-testid="Select"
			as="select"
			ref={reference}
			addons={{
				end: {
					content: (
						<span className="w-12 text-lg pointer-events-none text-theme-secondary-text">
							<Icon name="ChevronDownSmall" size="sm" />
						</span>
					),
				},
			}}
			defaultValue={defaultValue}
			{...properties}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{children}
		</Input>
	),
);

Select.displayName = "Select";
