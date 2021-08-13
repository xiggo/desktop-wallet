import { Contracts } from "@payvo/profiles";
import { Address } from "app/components/Address";
import { AmountCrypto } from "app/components/Amount";
import { Avatar } from "app/components/Avatar";
import { Button } from "app/components/Button";
import { Circle } from "app/components/Circle";
import { Icon } from "app/components/Icon";
import { TableCell, TableRow } from "app/components/Table";
import { Tooltip } from "app/components/Tooltip";
import { useEnvironmentContext } from "app/contexts";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface AddressRowProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string) => void;
}

export const AddressRow = ({ index, maxVotes, wallet, onSelect }: AddressRowProperties) => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);

	const getIconName = (type: string) => {
		if (type === "Starred") {
			return "StarFilled";
		}

		return type;
	};

	const getIconColor = (type: string) => (type === "Starred" ? "text-theme-warning-400" : "text-theme-secondary-600");

	useEffect(() => {
		const loadVotes = () => {
			let votes: Contracts.VoteRegistryItem[] = [];

			try {
				votes = wallet.voting().current();
			} catch {
				votes = [];
			}

			setVotes(votes);
		};

		loadVotes();
	}, [env, wallet]);

	const hasVotes = votes.length > 0;
	const [first, second, third, ...rest] = votes;

	const renderAvatar = (address: string, username?: string) => (
		<Tooltip content={username}>
			<span className="inline-block">
				<Avatar size="lg" address={address} />
			</span>
		</Tooltip>
	);

	const WalletIcon = ({ type }: { type: string }) => (
		<Tooltip content={t(`COMMON.${type.toUpperCase()}`)}>
			<div className={`inline-block p-1 ${getIconColor(type)}`}>
				<Icon name={getIconName(type)} size="lg" />
			</div>
		</Tooltip>
	);

	return (
		<TableRow>
			<TableCell variant="start" innerClassName="space-x-4">
				<Avatar className="flex-shrink-0" size="lg" address={wallet.address()} noShadow />
				<div className="w-40 flex-1">
					<Address address={wallet.address()} walletName={wallet.alias()} />
				</div>
			</TableCell>

			<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle">
				<div className="inline-flex items-center space-x-2">
					{[
						wallet.isLedger() && <WalletIcon key="ledger" type="Ledger" />,
						wallet.isStarred() && <WalletIcon key="star" type="Starred" />,
						wallet.hasSyncedWithNetwork() && wallet.isMultiSignature() && (
							<WalletIcon key="multisignature" type="Multisignature" />
						),
					]}
				</div>
			</TableCell>

			<TableCell innerClassName="justify-end font-bold text-theme-secondary-text whitespace-nowrap">
				<AmountCrypto value={wallet.balance()} ticker={wallet.network().ticker()} />
			</TableCell>

			<TableCell innerClassName="space-x-4 font-bold">
				{hasVotes ? (
					maxVotes === 1 ? (
						<>
							<Avatar size="lg" address={votes[0].wallet?.address()} noShadow />
							<span>{votes[0].wallet?.username()}</span>
						</>
					) : (
						<div className="flex items-center h-11">
							<div className="flex -space-x-3">
								{renderAvatar(first.wallet!.address(), first.wallet!.username())}

								{second && renderAvatar(second.wallet!.address(), second.wallet!.username())}

								{third && renderAvatar(third.wallet!.address(), third.wallet!.username())}

								{rest &&
									rest.length === 1 &&
									renderAvatar(rest[0].wallet!.address(), rest[0].wallet!.username())}

								{rest && rest.length > 1 && (
									<Circle size="lg" className="relative border-theme-text text-theme-text">
										<span className="font-semibold">+{rest.length}</span>
									</Circle>
								)}
							</div>
						</div>
					)
				) : (
					<>
						<Circle
							size="lg"
							className="border-theme-secondary-300 dark:border-theme-secondary-800"
							noShadow
						/>
						<span className="text-theme-secondary-400">{t("COMMON.NOT_AVAILABLE")}</span>
					</>
				)}
			</TableCell>

			{maxVotes === 1 ? (
				<>
					<TableCell innerClassName="justify-center font-bold text-theme-secondary-text">
						{votes[0]?.wallet && <span>#{votes[0].wallet.rank()}</span>}
					</TableCell>

					<TableCell innerClassName="justify-center">
						{hasVotes && (
							<Icon
								name="CircleCheckMark"
								className="text-theme-success-600"
								size="lg"
								data-testid="AddressRow__status"
							/>
						)}
					</TableCell>
				</>
			) : (
				<TableCell>
					<div className="font-bold text-theme-secondary-400">
						<span className="text-theme-secondary-text">{hasVotes ? votes.length : "0"}</span>
						<span>/{maxVotes}</span>
					</div>
				</TableCell>
			)}

			<TableCell variant="end" innerClassName="justify-end">
				<Button
					disabled={!wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()}
					variant="secondary"
					onClick={() => onSelect?.(wallet.address())}
					data-testid={`AddressRow__select-${index}`}
				>
					{t("COMMON.VOTE")}
				</Button>
			</TableCell>
		</TableRow>
	);
};
