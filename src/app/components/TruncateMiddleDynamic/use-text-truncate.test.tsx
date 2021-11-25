import React, { useRef } from "react";

import { act, render, screen } from "@/utils/testing-library";

import { useTextTruncate } from "./use-text-truncate";

let referenceElement: any;

const value = "Lorem ipsum dolor sit amet consectetur adipisicing elit.";

const Component = ({ value }: any) => {
	referenceElement = useRef();

	const truncated = useTextTruncate(referenceElement?.current, value);

	return (
		<div ref={referenceElement} className="inline-flex overflow-hidden">
			{truncated}
		</div>
	);
};

describe("useTextTruncate", () => {
	beforeEach(() => {
		referenceElement = undefined;
	});

	it("should return the value if the elements have no width", () => {
		const { asFragment, rerender } = render(<Component value={value} />);

		expect(screen.getByText(value)).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		const widthSpy = jest.spyOn(referenceElement.current, "offsetWidth", "get").mockReturnValue(0);

		const element = document.createElement("span");

		// offsetWidth is read twice for each overflow check
		const elementSpy = jest.spyOn(element, "offsetWidth", "get").mockReturnValueOnce(0).mockReturnValueOnce(0);

		const documentSpy = jest.spyOn(document, "createElement").mockReturnValue(element as WebviewTag);

		rerender(<Component value={value} />);

		expect(screen.getByText(value)).toBeInTheDocument();

		widthSpy.mockRestore();
		documentSpy.mockRestore();
		elementSpy.mockRestore();
	});

	it("should return the value if it fits the given container", () => {
		const { asFragment, rerender } = render(<Component value={value} />);

		expect(screen.getByText(value)).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		const widthSpy = jest.spyOn(referenceElement.current, "offsetWidth", "get").mockReturnValue(100);

		const element = document.createElement("span");

		// offsetWidth is read twice for each overflow check
		const elementSpy = jest.spyOn(element, "offsetWidth", "get").mockReturnValueOnce(50).mockReturnValueOnce(50);

		const documentSpy = jest.spyOn(document, "createElement").mockReturnValue(element);

		rerender(<Component value={value} />);

		expect(screen.getByText(value)).toBeInTheDocument();

		widthSpy.mockRestore();
		documentSpy.mockRestore();
		elementSpy.mockRestore();
	});

	it("should truncate the value if it does not fit the given container", () => {
		// Stores the callbacks used on the resize observer to manually trigger
		// them
		let resizeObserverCallback: ResizeObserverCallback;
		let requestAnimationFrameCallback: FrameRequestCallback;
		class ResizeObserverMock {
			constructor(callback: ResizeObserverCallback) {
				resizeObserverCallback = callback;
			}
			observe = jest.fn();
			unobserve = jest.fn();
			disconnect = jest.fn();
		}

		window.ResizeObserver = ResizeObserverMock;

		window.requestAnimationFrame = (callback: FrameRequestCallback) => {
			requestAnimationFrameCallback = callback;
			return 1;
		};

		render(<Component value={value} />);

		const widthSpy = jest.spyOn(referenceElement.current, "offsetWidth", "get").mockReturnValue(0);

		const element = document.createElement("span");

		// offsetWidth is read twice for each overflow check
		const elementSpy = jest
			.spyOn(element, "offsetWidth", "get")
			.mockReturnValueOnce(100)
			.mockReturnValueOnce(100)
			.mockReturnValueOnce(90)
			.mockReturnValueOnce(90)
			.mockReturnValueOnce(50)
			.mockReturnValueOnce(50);

		const documentSpy = jest.spyOn(document, "createElement").mockReturnValue(element);

		expect(screen.getByText(value)).toBeInTheDocument();

		// Emulates a resize observer event
		act(() => {
			resizeObserverCallback(
				[
					{
						target: referenceElement.current,
					},
				] as ResizeObserverEntry[],
				window.ResizeObserver as any,
			);

			requestAnimationFrameCallback(1);
		});

		expect(screen.getByText("Lorem ipsum dolor sit ame…ectetur adipisicing elit.")).toBeInTheDocument();

		widthSpy.mockRestore();
		documentSpy.mockRestore();
		elementSpy.mockRestore();
	});
});
