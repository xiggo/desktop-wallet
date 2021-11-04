/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the import wallet page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await t.click(Selector("button").withExactText(translations.COMMON.IMPORT));
		await t
			.expect(Selector("div").withText(translations.WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE).exists)
			.ok();
		await t.typeText(Selector('[data-testid="SelectNetworkInput__input"]'), "ARK Devnet", {
			paste: true,
		});

		await t.pressKey("enter");
		await t
			.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled"))
			.notOk("Cryptoasset selected", { timeout: 5000 });
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
		await t
			.expect(Selector("h1").withExactText(translations.WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE).exists)
			.ok();
	},
};
cucumber("@importWallet-mnemonic", {
	...preSteps,
	"When she enters a valid mnemonic to import": async (t: TestController) => {
		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, "buddy year cost vendor honey tonight viable nut female alarm duck symptom", {
			paste: true,
		});
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
	"And completes the import wallet steps for mnemonic": async (t: TestController) => {
		await t.expect(Selector("[data-testid=EncryptPassword]").exists).ok();
		await t.click(Selector("[data-testid=ImportWallet__skip-button]"));
		await t.click(Selector("[data-testid=ImportWallet__edit-alias]"));
		const walletNameInput = Selector("input[name=name]");
		await t.click(walletNameInput).pressKey("ctrl+a delete").typeText(walletNameInput, "Wallet Alias", {
			paste: true,
		});
		await t.click(Selector("[data-testid=UpdateWalletName__submit]"));
	},
	"Then the wallet is imported to her profile": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.GO_TO_WALLET));
	},
});
cucumber("@importWallet-address", {
	...preSteps,
	"When she changes the import type to address": async (t: TestController) => {
		await t.click('[data-testid="SelectDropdown__input"]');
		await t.click(Selector(".select-list-option__label").withText(translations.COMMON.ADDRESS));
	},
	"And enters a valid address to import": async (t: TestController) => {
		const addressInput = Selector("[data-testid=ImportWallet__address-input]");
		await t.typeText(addressInput, "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P", {
			paste: true,
		});
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
	"And completes the import wallet steps for address": async (t: TestController) => {
		await t.click(Selector("[data-testid=ImportWallet__edit-alias]"));
		const walletNameInput = Selector("input[name=name]");
		await t.click(walletNameInput).pressKey("ctrl+a delete").typeText(walletNameInput, "Wallet Alias", {
			paste: true,
		});
		await t.click(Selector("[data-testid=UpdateWalletName__submit]"));
	},
	"Then the wallet is imported to her profile": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.GO_TO_WALLET));
	},
});
cucumber("@importWallet-invalidAddress", {
	...preSteps,
	"When she changes the import type to address": async (t: TestController) => {
		await t.click('[data-testid="SelectDropdown__input"]');
		await t.click(Selector(".select-list-option__label").withText(translations.COMMON.ADDRESS));
	},
	"And enters an invalid address to import": async (t: TestController) => {
		const addressInput = Selector("[data-testid=ImportWallet__address-input]");
		await t.typeText(addressInput, "123", {
			paste: true,
		});
	},
	"Then an error is displayed on the address field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok({ timeout: 5000 });
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
cucumber("@importWallet-invalidMnemonic", {
	...preSteps,
	"When she enters an invalid mnemonic to import": async (t: TestController) => {
		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, "123", {
			paste: true,
		});
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok({ timeout: 5000 });
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
cucumber("@importWallet-duplicateAddress", {
	...preSteps,
	"And has imported a wallet": async (t: TestController) => {
		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, "buddy year cost vendor honey tonight viable nut female alarm duck symptom", {
			paste: true,
		});
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
		await t.expect(Selector("[data-testid=EncryptPassword]").exists).ok();
		await t.click(Selector("[data-testid=ImportWallet__skip-button]"));
		await t.click(Selector("[data-testid=ImportWallet__edit-alias]"));
		const walletNameInput = Selector("input[name=name]");
		await t.click(walletNameInput).pressKey("ctrl+a delete").typeText(walletNameInput, "Wallet Alias", {
			paste: true,
		});
		await t.click(Selector("[data-testid=UpdateWalletName__submit]"));
		await t.click(Selector("button").withExactText(translations.COMMON.GO_TO_WALLET));
	},
	"When she attempts to import the same wallet again": async (t: TestController) => {
		await t.click(Selector("a").withExactText("Portfolio"));
		await t.click(Selector("button").withExactText(translations.COMMON.IMPORT));
		await t
			.expect(Selector("div").withText(translations.WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE).exists)
			.ok();
		await t.typeText(Selector('[data-testid="SelectNetworkInput__input"]'), "ARK Devnet", {
			paste: true,
		});
		await t.pressKey("enter");
		await t
			.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled"))
			.notOk("Cryptoasset selected", { timeout: 5000 });
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
		await t
			.expect(Selector("h1").withExactText(translations.WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE).exists)
			.ok();
		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, "buddy year cost vendor honey tonight viable nut female alarm duck symptom", {
			paste: true,
		});
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok({ timeout: 5000 });
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
