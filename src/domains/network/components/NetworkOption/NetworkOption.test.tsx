import { Networks } from "@payvo/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { NetworkOption } from "./NetworkOption";
import { env, getDefaultProfileId, MNEMONICS, render, screen } from "@/utils/testing-library";

let network: Networks.Network;
let networkTestnet: Networks.Network;

describe("NetworkIcon", () => {
	beforeAll(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		const wallet1 = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.mainnet",
		});

		network = wallet1.network();
		networkTestnet = profile.wallets().first().network();
	});

	it("should render network", () => {
		render(<NetworkOption network={network} />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toHaveAttribute("aria-label", network.displayName());
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});

	it("should call onClick callback", () => {
		const onClick = jest.fn();

		render(<NetworkOption network={network} onClick={onClick} />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toHaveAttribute("aria-label", network.displayName());
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectNetwork__NetworkIcon--container"));

		expect(onClick).toHaveBeenCalledWith();
	});

	it("should not call onClick callback if disabled", () => {
		const onClick = jest.fn();

		render(<NetworkOption network={network} onClick={onClick} disabled />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toHaveAttribute("aria-label", network.displayName());
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectNetwork__NetworkIcon--container"));

		expect(onClick).not.toHaveBeenCalled();
	});

	it("should not render different class for testnet network", () => {
		const { asFragment } = render(<NetworkOption network={networkTestnet} />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.devnet")).toHaveAttribute(
			"aria-label",
			networkTestnet.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
		expect(asFragment).toMatchSnapshot();
	});
});
