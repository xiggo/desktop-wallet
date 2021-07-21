import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { WithProviders } from "utils/testing-library";

import { useCurrencyOptions } from "./use-currency-options";

describe("useCurrencyOptions", () => {
	it("should return currency options", () => {
		const wrapper = ({ children }: any) => <WithProviders>{children}</WithProviders>;
		const {
			result: { current: currencyOptions },
		} = renderHook(() => useCurrencyOptions(), { wrapper });

		expect(currencyOptions).toHaveLength(2);
		// Fiat
		expect(currencyOptions[0].options).toHaveLength(15);
		// Crypto
		expect(currencyOptions[1].options).toHaveLength(3);
	});
});
