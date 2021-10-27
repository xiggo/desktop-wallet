import { renderHook } from "@testing-library/react-hooks";
import { WithProviders } from "utils/testing-library";

import { useCurrencyOptions } from "./use-currency-options";

describe("useCurrencyOptions", () => {
	it("returns all currency options if no market provider is specified", () => {
		const {
			result: { current: currencyOptions },
		} = renderHook(() => useCurrencyOptions(), { wrapper: WithProviders });

		expect(currencyOptions).toHaveLength(2);
		// Fiat
		expect(currencyOptions[0].options).toHaveLength(16);
		// Crypto
		expect(currencyOptions[1].options).toHaveLength(3);
	});

	it("returns only supported currencies if market provider is specified and has unsupported currencies", () => {
		const {
			result: { current: currencyOptions },
		} = renderHook(() => useCurrencyOptions("cryptocompare"), { wrapper: WithProviders });

		expect(currencyOptions[0].options.map((option) => option.value)).not.toContain("VND");
	});
});
