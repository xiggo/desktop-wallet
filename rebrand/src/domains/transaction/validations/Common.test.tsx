/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@payvo/sdk";
import { LSK } from "@payvo/sdk-lsk";
import { renderHook } from "@testing-library/react-hooks";
import { useTranslation } from "react-i18next";

import { common } from "./Common";
import { env } from "@/utils/testing-library";

let network: Networks.Network;

describe("Common", () => {
	beforeAll(() => {
		network = env.profiles().first().wallets().first().network();
	});

	it("should validate low balance", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const commonValidation = common(t).fee(1, network);

		expect(commonValidation.validate.valid("1234")).toBe(
			t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
				balance: "1",
				coinId: network.coin(),
			}),
		);
	});

	it("should validate zero balance", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const error = t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
			balance: "0",
			coinId: network.coin(),
		});

		expect(common(t).fee(0, network).validate.valid(1234)).toBe(error);
		expect(common(t).fee(-1, network).validate.valid(1234)).toBe(error);
	});

	it("should require a fee", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		expect(common(t).fee(1, network).validate.valid("0")).toBe(
			t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: t("COMMON.FEE"),
			}),
		);
	});

	it("should fail to validate negative fee", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const commonValidation = common(t).fee(1, network);

		expect(commonValidation.validate.valid("-1")).toBe(t("TRANSACTION.VALIDATION.FEE_NEGATIVE"));
	});

	it("should validate minimum fee on network with size feeType", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const sizeFeeNetwork = new Networks.Network(LSK.manifest, LSK.manifest.networks["lsk.testnet"]);

		const commonValidation = common(t).fee(100, sizeFeeNetwork, {
			avg: 1,
			max: 1,
			min: 1,
			static: 1,
		});

		expect(commonValidation.validate.valid("0.5")).toBe(
			t("COMMON.VALIDATION.MIN").replace("{{field}}", t("COMMON.FEE")).replace("{{min}}", 1),
		);
	});
});
