import "jest-extended";

import { httpClient } from "app/services";
import nock from "nock";

import { exchangeHost, ExchangeService } from "./exchange.service";

let subject: ExchangeService;

const provider = "changenow";

describe("ExchangeService", () => {
	beforeAll(() => nock.disableNetConnect());

	beforeEach(() => {
		subject = new ExchangeService(provider, httpClient);
	});

	afterEach(() => nock.cleanAll());

	describe("#currency", () => {
		it("should retrieve an available currencies by its ticker", async () => {
			nock(exchangeHost)
				.get(`/${provider}/currencies/ark`)
				.reply(200, require("tests/fixtures/exchange/changenow/currency-ark.json"));

			const result = await subject.currency("ark");

			expect(result).toBeObject();
			expect(result.coin).toBe("ark");
		});
	});

	describe("#currencies", () => {
		it("should retrieve all available currencies", async () => {
			nock(exchangeHost)
				.get(`/${provider}/currencies`)
				.reply(200, require("tests/fixtures/exchange/changenow/currencies.json"));

			const result = await subject.currencies();

			expect(result).toBeArray();
		});
	});

	describe("#validateAddress", () => {
		it("should validate the given address", async () => {
			nock(exchangeHost)
				.get(`/${provider}/currencies/btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`)
				.reply(200, require("tests/fixtures/exchange/changenow/validate-address.json"));

			const result = await subject.validateAddress("btc", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");

			expect(result).toBe(true);
		});
	});

	describe("#minimalExchangeAmount", () => {
		it("should retrieve a pairs minimal exchange amount", async () => {
			nock(exchangeHost)
				.get(`/${provider}/tickers/btc/ark`)
				.reply(200, require("tests/fixtures/exchange/changenow/minimum.json"));

			const result = await subject.minimalExchangeAmount("btc", "ark");

			expect(result).toBeNumber();
		});
	});

	describe("#estimateExchangeAmount", () => {
		it("should retrieve a pairs minimal exchange amount", async () => {
			nock(exchangeHost)
				.get(`/${provider}/tickers/btc/ark/1`)
				.reply(200, require("tests/fixtures/exchange/changenow/estimate.json"));

			const result = await subject.estimateExchangeAmount("btc", "ark", 1);

			expect(result).toBeObject();
		});
	});

	describe("#createOrder", () => {
		it("should create an exchange order", async () => {
			nock(exchangeHost)
				.post(`/${provider}/orders`)
				.reply(200, require("tests/fixtures/exchange/changenow/order.json"));

			const result = await subject.createOrder({
				address: "payinAddress",
				amount: 1,
				from: "btc",
				to: "ark",
			});

			expect(result).toBeObject();
			expect(result.payinAddress).toBe("payinAddress");
		});
	});

	describe("#orderStatus", () => {
		it("should retrieve the status of an exchange order", async () => {
			nock(exchangeHost)
				.get(`/${provider}/orders/id`)
				.reply(200, require("tests/fixtures/exchange/changenow/status.json"));

			const result = await subject.orderStatus("id");

			expect(result).toBeObject();
			expect(result.id).toBe("id");
		});
	});
});
