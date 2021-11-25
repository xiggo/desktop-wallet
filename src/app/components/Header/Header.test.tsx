import React from "react";

import { Button } from "@/app/components/Button";
import { render, screen } from "@/utils/testing-library";

import { Header } from "./Header";

describe("Header", () => {
	it("should render an header", () => {
		const { container, asFragment } = render(<Header title="Header test" />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("header__title")).toHaveTextContent("Header test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render an header with a subtitle", () => {
		const { container, asFragment } = render(<Header title="Header test" subtitle="Subtitle test" />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("header__title")).toHaveTextContent("Header test");
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent("Subtitle test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render an header with extra", () => {
		const { container, asFragment } = render(
			<Header
				title="Header test"
				subtitle="Subtitle test"
				extra={
					<div className="flex justify-end space-x-3">
						<Button data-testid="header__extra">Extra 1</Button>
						<Button data-testid="header__extra">Extra 2</Button>
					</div>
				}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("header__title")).toHaveTextContent("Header test");
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent("Subtitle test");
		expect(screen.getAllByTestId("header__extra")).toHaveLength(2);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with title suffix", () => {
		const { container, asFragment } = render(
			<Header title="Header test" titleSuffix="suffix" subtitle="Subtitle test" />,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
