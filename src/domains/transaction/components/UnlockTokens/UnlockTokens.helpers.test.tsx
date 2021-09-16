import { BigNumber } from "@payvo/helpers";
import { DateTime } from "@payvo/intl";
import { Contracts } from "@payvo/profiles";
import { LSK } from "@payvo/sdk-lsk";
import { act, renderHook } from "@testing-library/react-hooks";
import { toasts } from "app/services";
import nock from "nock";
import { env, getDefaultProfileId } from "utils/testing-library";

import { POLLING_INTERVAL, UseFeesHook } from "./UnlockTokens.contracts";
import { useColumns, useFees, useUnlockableBalances } from "./UnlockTokens.helpers";

describe("useUnlockableBalances", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		jest.useFakeTimers();

		const profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	it("should fetch unlockable balances every 60 seconds", async () => {
		const unlockableBalances = jest.spyOn(wallet.coin().client(), "unlockableBalances").mockResolvedValue({
			current: BigNumber.make(30),
			objects: [
				{
					address: "lsk5gjpsoqgchb8shk8hvwez6ddx3a4b8gga59rw4",
					amount: BigNumber.make(30),
					height: "789",
					isReady: true,
					timestamp: DateTime.make("2020-01-01T00:00:00.000Z"),
				},
			],
			pending: BigNumber.make(0),
		});

		const { result, waitForNextUpdate } = renderHook(() => useUnlockableBalances(wallet));

		await waitForNextUpdate();

		expect(unlockableBalances).toHaveBeenCalledTimes(1);
		expect(result.current.items).toHaveLength(1);

		act(() => {
			jest.advanceTimersByTime(POLLING_INTERVAL + 500);
		});

		await waitForNextUpdate();

		expect(unlockableBalances).toHaveBeenCalledTimes(2);

		unlockableBalances.mockRestore();
	});

	it("should handle fetch error and retry", async () => {
		const unlockableBalances = jest
			.spyOn(wallet.coin().client(), "unlockableBalances")
			.mockImplementation(() => Promise.reject(new Error("unable to fetch")));

		const toastWarning = jest.spyOn(toasts, "warning").mockImplementation();

		const { result, waitForNextUpdate } = renderHook(() => useUnlockableBalances(wallet));

		await waitForNextUpdate();

		expect(result.current.items).toHaveLength(0);
		expect(unlockableBalances).toHaveBeenCalled();
		expect(toastWarning).toHaveBeenCalled();

		unlockableBalances.mockRestore();
		toastWarning.mockRestore();
	});
});

describe("useColumns", () => {
	it("should return columns", () => {
		const { result } = renderHook(() =>
			useColumns({
				canSelectAll: true,
				isAllSelected: false,
				onToggleAll: jest.fn(),
			}),
		);

		expect(result.current).toHaveLength(3);

		expect(result.current[0].id).toBe("amount");
		expect(result.current[1].id).toBe("time");
		expect(result.current[2].id).toBe("status");
	});
});

describe("useFees", () => {
	let profile: Contracts.IProfile;
	let useFeesResult: ReturnType<UseFeesHook>;

	beforeAll(async () => {
		nock.disableNetConnect();

		env.registerCoin("LSK", LSK);

		profile = env.profiles().create("empty");

		const { result } = renderHook(() =>
			useFees({
				coin: "LSK",
				network: "lsk.testnet",
				profile,
			}),
		);

		useFeesResult = result.current;

		const wallet = await profile.walletFactory().generate({
			coin: "LSK",
			network: "lsk.testnet",
		});

		jest.spyOn(profile.walletFactory(), "generate").mockResolvedValue(wallet);

		jest.spyOn(wallet.wallet.coin().transaction(), "unlockToken").mockResolvedValue({
			fee: () => BigNumber.make(0.0047),
		} as any);
	});

	it("should return 0 when objects is empty", async () => {
		const value = await useFeesResult.calculateFee([]);

		expect(value).toBe(0);
	});

	it("should calculate fee based on input objects", async () => {
		const value = await useFeesResult.calculateFee([
			{
				address: "lskw7488a9nqy6m3zkg68x6ynsp6ohg4y7wazs3mw",
				amount: BigNumber.make(10),
				height: "123",
				id: "1",
				isReady: true,
				timestamp: DateTime.make("2020-06-01T00:00:00.000Z"),
			},
			{
				address: "lskpyemv8bmamz5p8ub326cbgmob2p7yk9etf9nu4",
				amount: BigNumber.make(20),
				height: "234",
				id: "2",
				isReady: true,
				timestamp: DateTime.make("2020-06-15T00:00:00.000Z"),
			},
		]);

		expect(value).toBe(0.0047);
	});
});
