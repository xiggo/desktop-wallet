import React from "react";

import { Input } from "./Input";
import { Icon } from "@/app/components/Icon";

type InputPasswordProperties = React.InputHTMLAttributes<any>;

export const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProperties>((properties, reference) => {
	const [show, setShow] = React.useState(false);
	const togglePasswordVisibility = () => setShow(!show);

	return (
		<Input
			data-testid="InputPassword"
			ref={reference}
			type={show ? "text" : "password"}
			addons={{
				end: {
					content: (
						<button
							data-testid="InputPassword__toggle"
							type="button"
							onClick={togglePasswordVisibility}
							className="flex relative justify-center items-center w-full h-full text-2xl focus:outline-none ring-focus"
							data-ring-focus-margin="-m-1"
						>
							<Icon name={show ? "EyeSlash" : "Eye"} size="lg" />
						</button>
					),
				},
			}}
			{...properties}
		/>
	);
});

InputPassword.displayName = "InputPassword";
