import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();

	return useMemo(() => {
		const markAllTransactionsAsRead = (isVisible: boolean) => {
			if (!isVisible) {
				return;
			}

			profile.notifications().transactions().markAllAsRead();
		};

		const markAsRead = (isVisible: boolean, id: string) => {
			if (!isVisible) {
				return;
			}

			profile.notifications().markAsRead(id);
		};

		return {
			count: profile.notifications().count(),
			markAllTransactionsAsRead,
			markAsRead,
			releases: profile.notifications().releases().recent(),
			transactions: profile.notifications().transactions().transactions(),
		};
	}, [profile, isSyncing]); // eslint-disable-line react-hooks/exhaustive-deps
};
