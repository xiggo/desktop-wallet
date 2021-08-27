import { useEffect, useMemo, useState } from "react";

export const useTextTruncate = (referenceElement: any, value: string, offset = 0) => {
	const [referenceElementWidth, setReferenceElementWidth] = useState<number | undefined>(
		referenceElement instanceof HTMLElement ? referenceElement.offsetWidth : undefined,
	);

	useEffect(() => {
		const referenceResizeObserver = new ResizeObserver((entries) => {
			// Prevents: ResizeObserver loop limit exceeded exception
			window.requestAnimationFrame(() => {
				setReferenceElementWidth((entries[0].target as HTMLElement).offsetWidth);
			});
		});

		if (referenceElement instanceof HTMLElement) {
			referenceResizeObserver.observe(referenceElement);
		}

		return () => {
			referenceResizeObserver.disconnect();
		};
	}, [referenceElement]);

	return useMemo(() => {
		const hasOverflow = (element: HTMLElement) => {
			if (!element.offsetWidth || referenceElementWidth === undefined) {
				return false;
			}

			return element.offsetWidth > referenceElementWidth - offset;
		};

		if (!(referenceElement instanceof HTMLElement)) {
			return value;
		}

		const element = document.createElement("span");

		element.innerHTML = value;
		element.classList.add("fixed", "invisible", "w-auto", "whitespace-nowrap");

		referenceElement.append(element);

		let temporary = value;

		if (!hasOverflow(element)) {
			element.remove();
			return value;
		}

		let mid = Math.floor(value.length / 2) - 1;

		do {
			const prefix = value.slice(0, Math.max(0, mid));
			const suffix = value.slice(-mid);

			temporary = `${prefix}…${suffix}`;

			element.innerHTML = temporary;

			mid--;
		} while (mid && hasOverflow(element));

		element.remove();

		return temporary;
	}, [value, offset, referenceElementWidth, referenceElement]);
};
