import React from "react";
import {
	BalanceCell,
	ButtonsCell,
	CurrencyCell,
	InfoCell,
	WalletCell,
} from "@/app/components/WalletListItem/WalletListItem.blocks";
import { WalletListItemProperties } from "@/app/components/WalletListItem/WalletListItem.contracts";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

import { TableRow } from "@/app/components/Table";
import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";

export const WalletListItem: React.VFC<WalletListItemProperties> = ({ wallet, isCompact }) => {
	const isSynced = isFullySynced(wallet);
	const { handleToggleStar, handleOpen, handleSelectOption, handleSend, activeModal, setActiveModal } =
		useWalletActions(wallet);

	return (
		<>
			<TableRow onClick={isSynced ? handleOpen : undefined}>
				<WalletCell handleToggleStar={handleToggleStar} isCompact={isCompact} wallet={wallet} />
				<InfoCell isCompact={isCompact} wallet={wallet} />
				<BalanceCell wallet={wallet} isCompact={isCompact} isSynced={isSynced} />
				<CurrencyCell wallet={wallet} isCompact={isCompact} isSynced={isSynced} />
				<ButtonsCell
					wallet={wallet}
					isCompact={isCompact}
					handleSelectOption={handleSelectOption}
					handleSend={handleSend}
				/>
			</TableRow>
			{activeModal && (
				<tr>
					<td>
						<WalletActionsModals
							wallet={wallet}
							activeModal={activeModal}
							setActiveModal={setActiveModal}
						/>
					</td>
				</tr>
			)}
		</>
	);
};
