import cn from "classnames";
import React, { FC, useCallback, useEffect, useState } from "react";
import { styled } from "twin.macro";

import { DropdownOption, DropdownOptionGroup, DropdownProperties, DropdownVariantType } from "./Dropdown.contracts";
import { defaultClasses, getStyles } from "./Dropdown.styles";
import { DropdownItem } from "./DropdownItem.styles";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { clickOutsideHandler } from "@/app/hooks";
import { Position } from "@/types";

export const Wrapper = styled.div<{ position?: Position; variant: DropdownVariantType }>(getStyles);

export const Dropdown: FC<DropdownProperties> = ({
	children,
	dropdownClass,
	variant,
	options,
	onSelect,
	position = "right",
	toggleIcon = "Gear",
	toggleSize,
	toggleContent,
	disableToggle = false,
}) => {
	const rootDivReference = React.useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const onSelectOption = useCallback(
		(option: DropdownOption) => {
			setIsOpen(false);
			if (typeof onSelect === "function") {
				onSelect(option);
			}
		},
		[onSelect],
	);

	const renderOptions = useCallback(
		(options: DropdownOption[] | DropdownOptionGroup[], key?: string) => {
			const isOptionGroup = (options: DropdownOption | DropdownOptionGroup) =>
				(options as DropdownOptionGroup).key !== undefined;

			const renderOptionGroup = ({ key, hasDivider, title, options }: DropdownOptionGroup) => {
				if (options.length === 0) {
					return;
				}

				return (
					<div key={key} className="mt-4 first:mt-0">
						{hasDivider && (
							<div className="mx-8 -my-2">
								<Divider className="border-theme-secondary-300 dark:border-theme-secondary-600" />
							</div>
						)}
						<ul>
							{title && (
								<li className="block px-8 text-xs font-bold text-left uppercase whitespace-nowrap text-theme-secondary-500 dark:text-theme-secondary-600">
									{title}
								</li>
							)}
							{renderOptions(options, key)}
						</ul>
					</div>
				);
			};

			const renderIcon = ({ icon }: DropdownOption) => (
				<Icon
					name={icon!}
					className="dark:text-theme-secondary-600 dark:group-scope-hover:text-theme-secondary-200"
				/>
			);

			const onSelectItem = (event: React.MouseEvent | React.KeyboardEvent, option: DropdownOption) => {
				if (option.disabled) {
					return;
				}
				event.preventDefault();
				event.stopPropagation();
				onSelectOption(option);
			};

			if (options.length > 0 && isOptionGroup(options[0])) {
				return (
					<div className="pt-5 pb-1">
						{(options as DropdownOptionGroup[]).map((optionGroup: DropdownOptionGroup) =>
							renderOptionGroup(optionGroup),
						)}
					</div>
				);
			}

			return (
				<ul data-testid="dropdown__options">
					{(options as DropdownOption[]).map((option: DropdownOption, index: number) => (
						<DropdownItem
							aria-disabled={option.disabled}
							className={cn({ "group-scope": !option.disabled })}
							disabled={option.disabled}
							key={index}
							data-testid={`dropdown__option--${key ? `${key}-` : ""}${index}`}
							onClick={(event) => onSelectItem(event, option)}
							onKeyDown={(event) => {
								/* istanbul ignore next */
								if (event.key === "Enter" || event.key === " ") {
									onSelectItem(event, option);
								}
							}}
							tabIndex={option.disabled ? -1 : 0}
						>
							{option?.icon && option?.iconPosition === "start" && renderIcon(option)}
							<span>
								{option.label}
								{option.secondaryLabel && (
									<span className="ml-1 text-theme-secondary-500 dark:text-theme-secondary-600">
										{option.secondaryLabel}
									</span>
								)}
							</span>
							{option?.icon && option?.iconPosition !== "start" && renderIcon(option)}
						</DropdownItem>
					))}
				</ul>
			);
		},
		[onSelectOption],
	);

	const renderToggle = () => {
		if (!toggleContent) {
			return (
				<div className="cursor-pointer outline-none focus:outline-none">
					<Icon name={toggleIcon} size={toggleSize} />
				</div>
			);
		}

		// Call children as a function and provide isOpen state
		if (typeof toggleContent === "function") {
			return toggleContent(isOpen);
		}

		// Render children as provided
		return toggleContent;
	};

	const toggleHandler = useCallback(
		(event: React.MouseEvent) => {
			if (disableToggle) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			setIsOpen(!isOpen);
		},
		[disableToggle, setIsOpen, isOpen],
	);

	const hide = useCallback(() => setIsOpen(false), [setIsOpen]);

	const handleResize = useCallback(() => {
		const parentElement = rootDivReference.current;
		if (!parentElement) {
			return;
		}

		const numberFromPixels = (value: string): number => (value ? Number.parseInt(value.replace("px", "")) : 0);

		const OFFSET = 30;

		const toggleElement = parentElement.querySelector<HTMLElement>('[data-testid="dropdown__toggle"]');
		const dropdownElement = parentElement.querySelector<HTMLElement>('[data-testid="dropdown__content"]');

		if (!toggleElement || !dropdownElement) {
			return;
		}

		const setStyles = (styles: Partial<CSSStyleDeclaration>) => {
			Object.assign(dropdownElement.style, styles);
		};

		const toggleHeight = toggleElement.parentElement!.offsetHeight;

		const spaceBefore = toggleElement.getBoundingClientRect().top + document.documentElement.scrollTop;
		const spaceAfter = document.body.clientHeight - (spaceBefore + toggleHeight);

		setStyles({ height: "", marginTop: "" });

		const styles = getComputedStyle(dropdownElement);

		const calculatedSpace = dropdownElement.offsetHeight + numberFromPixels(styles.marginTop) + OFFSET;
		if (spaceAfter < calculatedSpace && spaceBefore > calculatedSpace) {
			setStyles({
				marginTop: `-${dropdownElement.offsetHeight + toggleHeight + numberFromPixels(styles.marginTop)}px`,
				opacity: "1",
			});
			return;
		}

		const newHeight = spaceAfter - numberFromPixels(styles.marginTop) - OFFSET;

		const newStyles =
			newHeight >=
			dropdownElement.firstElementChild!.clientHeight +
				numberFromPixels(styles.paddingTop) +
				numberFromPixels(styles.paddingBottom)
				? {
						height: "",
						overflowY: "",
				  }
				: {
						height: `${newHeight}px`,
						marginTop: "",
						overflowY: "scroll",
				  };

		setStyles({ opacity: "1", ...newStyles });
	}, [rootDivReference]);

	useEffect(() => {
		if (isOpen) {
			window.addEventListener("resize", handleResize);
		}

		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, [isOpen, handleResize]);

	useEffect(() => clickOutsideHandler(rootDivReference, hide), [rootDivReference, hide]);

	useEffect(() => {
		const handleKeys = (event: KeyboardEvent) => {
			/* istanbul ignore next */
			if (event.key === "Escape") {
				hide();
			}
		};

		if (isOpen) {
			window.addEventListener("keydown", handleKeys);
		}

		return () => window.removeEventListener("keydown", handleKeys);
	}, [isOpen, hide]);

	return (
		<div ref={rootDivReference} className="relative">
			<span data-testid="dropdown__toggle" onClick={toggleHandler}>
				{renderToggle()}
			</span>

			{isOpen && (
				<Wrapper
					data-testid="dropdown__content"
					position={position}
					variant={variant || options ? "options" : "custom"}
					className={cn("opacity-0", defaultClasses, dropdownClass)}
				>
					{options?.length && renderOptions(options)}
					{children && <div>{children}</div>}
				</Wrapper>
			)}
		</div>
	);
};
