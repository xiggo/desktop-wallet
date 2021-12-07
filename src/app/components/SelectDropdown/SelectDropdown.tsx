import cn from "classnames";
import { useCombobox } from "downshift";
import React, { useEffect, useMemo, useState } from "react";

import { OptionProperties, SelectDropdownProperties, SelectProperties } from "./SelectDropdown.contracts";
import { getMainOptions, isMatch, matchOptions } from "./SelectDropdown.helpers";
import { SelectDropdownRenderOptions as RenderOptions } from "./SelectDropdownRenderOptions";
import { SelectOptionsList } from "./styles";
import { Input } from "@/app/components/Input";
import { Icon } from "@/app/components/Icon";
import { useFormField } from "@/app/components/Form/useFormField";

const itemToString = (item: OptionProperties | null) => item?.label || "";

const SelectDropdown = ({
	addons,
	options,
	mainOptions,
	defaultSelectedItem,
	placeholder,
	disabled,
	onSelectedItemChange,
	isInvalid,
	className,
	innerClassName,
	allowFreeInput = false,
	showCaret = true,
	showOptions = true,
	renderLabel,
	id,
}: SelectDropdownProperties) => {
	const [data, setData] = useState(options);
	const [isTyping, setIsTyping] = useState(false);

	const handleInputChange = ({ selectedItem }: { selectedItem: OptionProperties }) => {
		if (!allowFreeInput) {
			return;
		}
		onSelectedItemChange({ selected: selectedItem });
	};

	const {
		isOpen,
		closeMenu,
		openMenu,
		getComboboxProps,
		getLabelProps,
		getInputProps,
		getItemProps,
		getMenuProps,
		selectItem,
		inputValue,
		highlightedIndex,
		reset,
		toggleMenu,
		selectedItem,
	} = useCombobox<OptionProperties | null>({
		id,
		itemToString,
		items: getMainOptions(data),
		onInputValueChange: ({ inputValue, selectedItem, type }) => {
			if (type === "__input_change__") {
				setIsTyping(true);
			} else {
				setIsTyping(false);
			}

			if (allowFreeInput) {
				const selected = { label: inputValue as string, value: inputValue as string };

				selectItem(selected);
				onSelectedItemChange({ selected });

				const matchedOptions = inputValue ? matchOptions(options, inputValue) : mainOptions;

				if (matchedOptions.length === 0) {
					closeMenu();
				}

				return;
			}

			// Clear selection when user is changing input,
			// and input does not match previously selected item
			if (selectedItem && selectedItem.label !== inputValue) {
				reset();
			}
		},
		onSelectedItemChange: ({ selectedItem }) => {
			if (allowFreeInput) {
				return;
			}

			onSelectedItemChange?.({ selected: selectedItem });
		},
	});

	useEffect(() => {
		if (isTyping && inputValue) {
			return setData(matchOptions(options, inputValue));
		}

		setData(options);
	}, [inputValue, isTyping, options]);

	const { value: defaultValue } = { ...defaultSelectedItem };
	useEffect(() => {
		selectItem(defaultSelectedItem ?? null);
	}, [defaultValue, selectItem]); // eslint-disable-line react-hooks/exhaustive-deps

	const suggestion = useMemo(() => {
		const firstMatch = mainOptions.find((option) => isMatch(inputValue, option));
		if (inputValue && firstMatch) {
			return [inputValue, firstMatch.label.slice(inputValue.length)].join("");
		}
	}, [inputValue, mainOptions]);

	if (showCaret) {
		addons = {
			...addons,
			end: {
				content: (
					<div
						data-testid="SelectDropdown__caret"
						className="flex justify-center items-center py-2 px-1"
						onClick={toggleMenu}
					>
						<Icon
							name="CaretDown"
							className={cn(
								"transition-transform",
								isInvalid ? "text-theme-danger-500" : "text-theme-secondary-500",
								{
									"transform rotate-180": isOpen,
								},
							)}
							size="sm"
						/>
					</div>
				),
			},
		};
	}

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		if (allowFreeInput) {
			const selectedItem = { label: event.target.value, value: event.target.value };
			handleInputChange({ selectedItem });
			return;
		}

		const firstMatch = mainOptions.find((option) => isMatch(inputValue, option));

		if (inputValue && firstMatch) {
			selectItem(firstMatch);
			handleInputChange({ selectedItem: firstMatch });

			closeMenu();
		} else {
			reset();
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Tab" || event.key === "Enter") {
			// check if item already was selected
			if (selectedItem?.label === inputValue) {
				return;
			}

			// Select first suggestion
			const firstMatch = mainOptions.find((option) => isMatch(inputValue, option));

			if (inputValue && firstMatch) {
				selectItem(firstMatch);
				handleInputChange({ selectedItem: firstMatch });

				if (event.key === "Enter") {
					closeMenu();
				}
			}
		}
	};

	const onMouseDown = (item: OptionProperties) => {
		selectItem(item);
		handleInputChange({ selectedItem: item });
		closeMenu();
	};

	return (
		<div className="relative w-full">
			<div {...getComboboxProps()}>
				<label {...getLabelProps()} />
				<Input
					data-testid="SelectDropdown__input"
					suggestion={suggestion}
					disabled={disabled}
					isInvalid={isInvalid}
					addons={addons}
					innerClassName={cn({ "cursor-default": !inputValue }, innerClassName)}
					{...getInputProps({
						className,
						onBlur: handleBlur,
						onFocus: openMenu,
						onKeyDown: handleKeyDown,
						placeholder,
					})}
				/>
				<SelectOptionsList {...getMenuProps({ className: showOptions && isOpen ? "is-open" : "" })}>
					{showOptions && isOpen && (
						<RenderOptions
							data={data}
							getItemProps={getItemProps}
							highlightedIndex={highlightedIndex}
							inputValue={inputValue}
							onMouseDown={onMouseDown}
							renderLabel={renderLabel}
						/>
					)}
				</SelectOptionsList>
			</div>
		</div>
	);
};

export const Select = React.forwardRef<HTMLInputElement, SelectProperties>(
	(
		{
			addons,
			options,
			defaultValue = "",
			placeholder = "Select option",
			className,
			innerClassName,
			allowFreeInput,
			showCaret,
			showOptions,
			isInvalid,
			disabled = false,
			onChange,
			renderLabel,
			id,
		}: SelectProperties,
		reference,
	) => {
		const mainOptions = useMemo(() => getMainOptions(options), [options]);

		const defaultSelectedItem = useMemo(
			() =>
				allowFreeInput
					? ({ label: defaultValue, value: defaultValue } as OptionProperties)
					: mainOptions.find((option: OptionProperties) => option.value === defaultValue),
			[defaultValue, allowFreeInput, mainOptions],
		);

		const [selected, setSelected] = useState(defaultSelectedItem);

		const fieldContext = useFormField();
		const isInvalidField = fieldContext?.isInvalid || isInvalid;

		return (
			<div className="relative w-full">
				<Input
					data-testid="select-list__input"
					ref={reference}
					value={selected?.value || ""}
					className="sr-only"
					isInvalid={isInvalidField}
					readOnly
					tabIndex={-1}
				/>
				<SelectDropdown
					id={id}
					allowFreeInput={allowFreeInput}
					showCaret={showCaret}
					showOptions={showOptions}
					className={className}
					innerClassName={innerClassName}
					options={options}
					mainOptions={mainOptions}
					defaultSelectedItem={defaultSelectedItem}
					placeholder={placeholder}
					disabled={disabled}
					isInvalid={isInvalidField}
					addons={addons}
					onSelectedItemChange={({ selected }: { selected: OptionProperties }) => {
						setSelected(selected);
						onChange?.(selected);
					}}
					renderLabel={renderLabel}
				/>
			</div>
		);
	},
);

Select.displayName = "Select";
