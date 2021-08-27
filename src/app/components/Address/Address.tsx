import { TruncateEnd } from "app/components/TruncateEnd";
import { TruncateMiddleDynamic } from "app/components/TruncateMiddleDynamic";
import React from "react";
import { Size } from "types";

interface Properties {
	walletName?: string;
	addressClass?: string;
	address?: string;
	maxNameChars?: number;
	walletNameClass?: string;
	size?: Size;
	fontWeight?: "normal";
	truncateOnTable?: boolean;
}

const AddressWrapper = ({ children, truncateOnTable }: { children: JSX.Element; truncateOnTable?: boolean }) =>
	truncateOnTable ? (
		<div className="relative flex-grow">
			{children}
			{/* The workaround used to make the truncating work on tables means
			wrapping the address on a DIV with an absolute position that doesn't
			keep the space for the element, so we need to add an empty element
			as a spacer. */}
			<span>&nbsp;</span>
		</div>
	) : (
		<>{children}</>
	);

export const Address = ({
	address,
	addressClass,
	walletNameClass,
	fontWeight,
	walletName,
	maxNameChars,
	size,
	truncateOnTable,
}: Properties) => {
	const getFontSize = (size?: Size) => {
		switch (size) {
			case "sm":
				return "text-sm";
			case "lg":
				return "text-lg";
			case "xl":
				return "text-xl";
			default:
				return "text-base";
		}
	};

	const getFontWeight = (fontWeight?: string) => {
		switch (fontWeight) {
			case "normal":
				return "font-normal";
			default:
				return "font-semibold";
		}
	};

	return (
		<div className="flex overflow-hidden flex-grow items-center space-x-2 whitespace-nowrap no-ligatures">
			{walletName && (
				<span
					data-testid="Address__alias"
					className={`${getFontWeight(fontWeight)} ${getFontSize(size)} ${
						walletNameClass || "text-theme-text"
					}`}
				>
					<TruncateEnd
						text={walletName}
						maxChars={maxNameChars}
						showTooltip={!!maxNameChars && walletName.length > maxNameChars}
					/>
				</span>
			)}
			{address && (
				<AddressWrapper truncateOnTable={truncateOnTable}>
					<TruncateMiddleDynamic
						data-testid="Address__address"
						value={address}
						className={`${
							addressClass ||
							(walletName ? "text-theme-secondary-500 dark:text-theme-secondary-700" : "text-theme-text")
						} ${getFontWeight(fontWeight)} ${getFontSize(size)}${
							truncateOnTable ? " absolute w-full" : ""
						}`}
					/>
				</AddressWrapper>
			)}
		</div>
	);
};
