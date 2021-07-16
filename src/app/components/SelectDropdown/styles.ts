import tw, { styled } from "twin.macro";

export const SelectOptionsList = styled.ul`
	& {
		${tw`absolute top-full mt-1 z-10 w-full`};
		${tw`bg-theme-background dark:bg-theme-secondary-800`};
		${tw`rounded-lg shadow-xl outline-none`};
	}

	&.is-open {
		${tw`py-6 overflow-y-auto max-h-64`}
	}

	.select-list-option {
		${tw`relative px-10 border-0 text-theme-secondary-900 dark:text-theme-secondary-200 cursor-pointer transition-colors duration-200`};

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
			${tw`-mt-0.5 pt-0.5`};
		}

		&.is-highlighted {
			${tw`bg-theme-secondary-100 dark:bg-theme-secondary-900`};

			.select-list-option__label {
				${tw`border-transparent`};
			}
		}

		&.is-selected {
			${tw`bg-theme-primary-50 dark:bg-black text-theme-primary-600 font-semibold`};

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
