import { Networks } from "@payvo/sdk";
import cn from "classnames";
import React from "react";

import { useFormField } from "@/app/components/Form/useFormField";
import { Input } from "@/app/components/Input";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";

type Properties = {
	network?: Networks.Network;
	suggestion?: string;
} & React.InputHTMLAttributes<any>;

export const SelectNetworkInput = React.forwardRef<HTMLInputElement, Properties>(
	({ network, suggestion, ...properties }: Properties, reference) => {
		const fieldContext = useFormField();

		const isInvalidValue = fieldContext?.isInvalid;

		return (
			<Input
				data-testid="SelectNetworkInput__input"
				ref={reference}
				suggestion={suggestion}
				addons={{
					start: {
						content: (
							<NetworkIcon
								data-testid="SelectNetworkInput__network"
								className={cn({
									"border-theme-danger-500 text-theme-danger-500": isInvalidValue,
									"border-theme-secondary-200 dark:border-theme-secondary-700 text-theme-secondary-500":
										!isInvalidValue,
								})}
								network={network}
								size="sm"
								showTooltip={false}
								noShadow
							/>
						),
					},
				}}
				{...properties}
			/>
		);
	},
);

SelectNetworkInput.displayName = "SelectNetworkInput";
