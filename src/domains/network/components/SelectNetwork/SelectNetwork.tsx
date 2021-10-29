import { Networks } from "@payvo/sdk";
import { Divider } from "app/components/Divider";
import { Toggle } from "app/components/Toggle";
import cn from "classnames";
import { NetworkOption } from "domains/network/components/NetworkOption";
import { useCombobox } from "downshift";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SelectNetworkInput } from "./SelectNetworkInput";

interface SelectNetworkProperties {
	autoFocus?: boolean;
	disabled?: boolean;
	hideOptions?: boolean;
	id?: string;
	name?: string;
	networks: Networks.Network[];
	onInputChange?: (value?: string, suggestion?: string) => void;
	onSelect?: (network?: Networks.Network | null) => void;
	placeholder?: string;
	selected?: Networks.Network;
	value?: string;
}

export const itemToString = (item: Networks.Network | null) => item?.displayName() || "";

const defaultProps = {
	networks: [],
};

export const SelectNetwork = ({
	autoFocus,
	disabled = false,
	hideOptions,
	id,
	name,
	networks = defaultProps.networks,
	onInputChange,
	onSelect,
	placeholder,
	selected,
}: SelectNetworkProperties) => {
	const { t } = useTranslation();

	const [suggestion, setSuggestion] = useState("");
	const [showDevelopmentNetworks, setShowDevelopmentNetworks] = useState(false);

	const isMatch = (inputValue: string, network: Networks.Network) =>
		inputValue && network.displayName().toLowerCase().startsWith(inputValue.toLowerCase());

	const {
		openMenu,
		getComboboxProps,
		getLabelProps,
		getInputProps,
		getMenuProps,
		selectItem,
		selectedItem,
		inputValue,
		reset,
	} = useCombobox<Networks.Network | null>({
		id,
		itemToString,
		items: networks,
		onInputValueChange: ({ inputValue, selectedItem }) => {
			// Clear selection when user is changing input,
			// and input does not match previously selected item
			if (selectedItem && selectedItem.displayName() !== inputValue) {
				reset();
			}

			if (!inputValue) {
				setSuggestion("");
				return onInputChange?.();
			}

			let newSuggestion = "";

			if (inputValue !== selectedItem?.displayName()) {
				const matches = networks.filter((network: Networks.Network) => isMatch(inputValue, network));

				if (matches.length > 0) {
					newSuggestion = [inputValue, matches[0].displayName().slice(inputValue.length)].join("");
				}
			}

			setSuggestion(newSuggestion);

			onInputChange?.(inputValue, newSuggestion);
		},
		onSelectedItemChange: ({ selectedItem }) => {
			setSuggestion("");

			if (selectedItem && !selectedItem.isLive() && !showDevelopmentNetworks) {
				setShowDevelopmentNetworks(true);
			}

			onSelect?.(selectedItem);
		},
	});

	useEffect(() => {
		selectItem(selected || null);
	}, [selectItem, selected, disabled]);

	const toggleSelection = (item: Networks.Network) => {
		if (item.id() === selectedItem?.id()) {
			setSuggestion("");
			reset();
			openMenu();
			return;
		}
		selectItem(item);
	};

	const publicNetworks = networks.filter((network) => network.isLive());
	const developmentNetworks = networks.filter((network) => network.isTest());

	const optionClassName = (network: Networks.Network) => {
		if (selectedItem) {
			// `network` is the selected item

			if (selectedItem.displayName() === network.displayName()) {
				return "border-theme-success-500 dark:border-theme-success-600 bg-theme-success-100 dark:bg-theme-success-900 text-theme-secondary-600 dark:text-theme-secondary-200";
			}

			return undefined;
		}

		// no input or input matches `network`
		if (!inputValue || isMatch(inputValue, network)) {
			return undefined;
		}

		// input does not match `network`
		return "text-theme-secondary-500 dark:text-theme-secondary-800 border-theme-primary-100 dark:border-theme-secondary-800";
	};

	const hasPublicNetworks = publicNetworks.length > 0;
	const hasDevelopmentNetworks = developmentNetworks.length > 0;

	return (
		<div>
			<div data-testid="SelectNetwork" {...getComboboxProps()}>
				<label {...getLabelProps()} />
				<SelectNetworkInput
					autoFocus={autoFocus}
					network={selectedItem}
					suggestion={suggestion}
					disabled={disabled}
					{...getInputProps({
						name,
						onFocus: openMenu,
						onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
							if (event.key === "Enter") {
								const firstMatch = networks.find((network: Networks.Network) =>
									isMatch(inputValue, network),
								);
								if (inputValue && firstMatch) {
									selectItem(firstMatch);
								}

								event.preventDefault();
								return;
							}
						},
						placeholder: placeholder || t("COMMON.INPUT_NETWORK.PLACEHOLDER"),
					})}
				/>
			</div>

			<div data-testid="SelectNetwork__options" className={cn({ hidden: hideOptions })}>
				<div className={cn("mt-6", { hidden: !hasPublicNetworks })}>
					{hasDevelopmentNetworks && (
						<div className="text-sm font-bold text-theme-secondary-400 dark:text-theme-secondary-700">
							{t("COMMON.PUBLIC_NETWORKS").toUpperCase()}
						</div>
					)}

					<ul {...getMenuProps()} className="grid grid-cols-7 gap-3 mt-3">
						{publicNetworks.map((network: Networks.Network, index: number) => (
							<NetworkOption
								key={index}
								disabled={disabled}
								network={network}
								iconClassName={optionClassName(network)}
								onClick={() => toggleSelection(network)}
							/>
						))}
					</ul>
				</div>

				{hasPublicNetworks && hasDevelopmentNetworks && <Divider dashed />}

				<div className={cn("mt-6", { hidden: !hasDevelopmentNetworks })}>
					{hasPublicNetworks && (
						<div className="flex justify-between items-center">
							<span className="text-sm font-bold text-theme-secondary-400 dark:text-theme-secondary-700">
								{t("COMMON.DEVELOPMENT_NETWORKS").toUpperCase()}
							</span>

							<span data-testid="SelectNetwork__developmentNetworks">
								<Toggle
									data-testid="SelectNetwork__developmentNetworks-toggle"
									checked={showDevelopmentNetworks}
									onChange={() => setShowDevelopmentNetworks(!showDevelopmentNetworks)}
								/>
							</span>
						</div>
					)}

					<ul
						{...getMenuProps()}
						className={cn("grid grid-cols-7 gap-3 mt-3", {
							hidden: !showDevelopmentNetworks && hasPublicNetworks,
						})}
					>
						{developmentNetworks.map((network: Networks.Network, index: number) => (
							<NetworkOption
								key={index}
								disabled={disabled}
								network={network}
								iconClassName={optionClassName(network)}
								onClick={() => toggleSelection(network)}
							/>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};
