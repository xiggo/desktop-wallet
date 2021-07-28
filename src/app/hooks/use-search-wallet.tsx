import { Contracts } from "@payvo/profiles";
import { RecipientProperties } from "domains/transaction/components/SearchRecipient/SearchRecipient.models";
import { useCallback, useMemo, useState } from "react";

export const useSearchWallet = (list: Contracts.IReadWriteWallet[] | RecipientProperties[]) => {
	const [searchKeyword, setSearchKeyword] = useState("");

	const matchKeyword = useCallback((value?: string) => value?.toLowerCase().includes(searchKeyword.toLowerCase()), [
		searchKeyword,
	]);

	const filteredList = useMemo(() => {
		if (searchKeyword.length === 0) {
			return list;
		}

		if (typeof list[0].address === "string") {
			return (list as RecipientProperties[]).filter(
				({ address, alias }) => matchKeyword(address) || matchKeyword(alias),
			);
		}

		return (list as Contracts.IReadWriteWallet[]).filter(
			(wallet) => matchKeyword(wallet.address()) || matchKeyword(wallet.alias()),
		);
	}, [list, matchKeyword, searchKeyword.length]);

	const isEmptyResults = useMemo(() => searchKeyword.length > 0 && filteredList.length === 0, [
		filteredList.length,
		searchKeyword.length,
	]);

	return {
		filteredList,
		isEmptyResults,
		setSearchKeyword,
	};
};
