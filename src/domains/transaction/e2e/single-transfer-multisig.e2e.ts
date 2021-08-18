import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { createFixture, mockMuSigRequest, mockRequest } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWalletByAddress } from "../../wallet/e2e/common";
import { goToTransferPage } from "./common";

const translations = buildTranslations();

createFixture("Single Transfer action", [
	mockRequest(
		{
			method: "POST",
			url: "https://ark-test.payvo.com/api/transactions",
		},
		{
			data: {
				accept: ["transaction-id"],
				broadcast: ["transaction-id"],
				excess: [],
				invalid: [],
			},
		},
	),
	mockMuSigRequest("https://ark-test-musig.payvo.com", "store", {
		result: {
			id: "transaction-id",
		},
	}),
]);

test("should send transfer successfully with a multisig wallet", async (t) => {
	// Navigate to profile page
	await goToProfile(t);

	// Import wallet
	await importWalletByAddress(t, "DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq");

	// Navigate to transfer page
	await goToTransferPage(t);

	// Select recipient
	await t.click(Selector("[data-testid=SelectRecipient__select-recipient]"));
	await t.expect(Selector("[data-testid=modal__inner]").exists).ok();
	await t.click(Selector("[data-testid=RecipientListItem__select-button-0]"));

	// Amount
	await t.click(Selector("[data-testid=AddRecipient__send-all]"));

	// Review step
	await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
	await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
	await t.click(Selector("button").withText(translations.COMMON.CONTINUE));

	// Transaction successful
	await t.expect(Selector("[data-testid=TransactionSuccessful]").exists).ok();
});
