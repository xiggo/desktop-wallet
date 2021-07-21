import tw, { styled } from "twin.macro";

export const SelectOptionsList = styled.ul`
	& {
		${tw`absolute top-full mt-[5px] z-10 -inset-x-px`};
		${tw`bg-theme-background dark:bg-theme-secondary-800`};
		${tw`rounded-lg shadow-xl outline-none`};
	}

	&.is-open {
		${tw`py-6 overflow-y-auto max-h-64`}
	}

	.select-list-option-group:not(:last-child) {
		${tw`mb-3`};
	}

	.select-list-option-head,
	.select-list-option {
		${tw`relative px-10 border-0`};
	}

	.select-list-option-head {
		&__label {
			${tw`text-xs font-bold text-theme-secondary-500 dark:text-theme-secondary-700 pb-1 uppercase select-none`};
		}
	}

	.select-list-option {
		${tw`text-theme-secondary-900 dark:text-theme-secondary-200 cursor-pointer transition-colors duration-200`};

		&__label {
			${tw`py-4`};
		}

		&:not(:last-child) {
			.select-list-option__label {
				${tw`border-b border-theme-secondary-300 dark:border-theme-secondary-700`};
			}
		}

		&.is-highlighted,
		&.is-selected {
			${tw`-mt-px pt-px`};
		}

		&.is-highlighted {
			${tw`bg-theme-secondary-100 dark:bg-theme-secondary-900 z-10`};

			.select-list-option__label {
				${tw`border-transparent`};
			}
		}

		&.is-selected {
			${tw`bg-theme-primary-50 dark:bg-black text-theme-primary-600 font-semibold z-20`};

			.select-list-option__label {
				${tw`border-theme-primary-50 dark:border-black`};
			}

			&:before {
				${tw`content block absolute w-1 h-full inset-y-0 left-0 bg-theme-primary-600`}
			}
		}

		&.is-empty {
			${tw`cursor-default`}
		}
	}
`;
