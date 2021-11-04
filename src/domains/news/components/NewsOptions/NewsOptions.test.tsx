import React from "react";
import { fireEvent, render, waitFor } from "utils/testing-library";

import { NewsOptions } from "./NewsOptions";

const categories = ["Technical"];
const coins = ["ark"];

describe("NewsOptions", () => {
	it("should render", () => {
		const { container, asFragment } = render(<NewsOptions selectedCategories={categories} selectedCoins={coins} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select category", () => {
		const { getByTestId } = render(
			<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={jest.fn()} />,
		);

		fireEvent.click(getByTestId("NewsOptions__category-Technical"));
	});

	it("should select asset", () => {
		const { getByTestId } = render(<NewsOptions selectedCategories={categories} selectedCoins={coins} />);

		const arkOption = getByTestId("NetworkOption__ark.mainnet");
		fireEvent.click(arkOption);
	});

	it("should emit onSubmit with all selected filters", async () => {
		const onSubmit = jest.fn();

		const { getByTestId } = render(
			<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={onSubmit} />,
		);

		fireEvent.click(getByTestId("NewsOptions__category-Technical"));
		fireEvent.click(getByTestId("NetworkOption__ark.mainnet"));

		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith({
				categories: ["Technical"],
				coins: ["ARK"],
			}),
		);
	});
});
