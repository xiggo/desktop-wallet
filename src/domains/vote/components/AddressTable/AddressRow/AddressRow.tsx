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
import cn from "classnames";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface AddressRowProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string) => void;
	isCompact?: boolean;
}

export const AddressRow = ({ index, maxVotes, wallet, onSelect, isCompact = false }: AddressRowProperties) => {
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
			let votes: Contracts.VoteRegistryItem[];

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
				<Avatar
					className={cn({ "ring-2 ring-theme-background": isCompact })}
					size={isCompact ? "xs" : "lg"}
					address={address}
					noShadow={isCompact}
				/>
			</span>
		</Tooltip>
	);

	const renderRestOfVotes = (restOfVotes: number) => {
		const rest = (
			<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-600">
				+{restOfVotes}
			</span>
		);

		if (isCompact) {
			return <div className="pl-3">{rest}</div>;
		}

		return (
			<Circle
				size="lg"
				className="relative bg-theme-background border-theme-secondary-900 dark:border-theme-secondary-600"
			>
				{rest}
			</Circle>
		);
	};

	const WalletIcon = ({ type }: { type: string }) => (
		<Tooltip content={t(`COMMON.${type.toUpperCase()}`)}>
			<div className={`inline-block p-1 ${getIconColor(type)}`}>
				<Icon name={getIconName(type)} size="lg" />
			</div>
		</Tooltip>
	);

	return (
		<TableRow>
			<TableCell
				variant="start"
				innerClassName={cn({ "space-x-3": isCompact }, { "space-x-4": !isCompact })}
				isCompact={isCompact}
			>
				<Avatar className="flex-shrink-0" size={isCompact ? "xs" : "lg"} address={wallet.address()} noShadow />
				<div className="w-40 flex-1">
					<Address address={wallet.address()} walletName={wallet.alias()} />
				</div>
			</TableCell>

			<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle" isCompact={isCompact}>
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

			<TableCell
				innerClassName="justify-end font-bold text-theme-secondary-text whitespace-nowrap"
				isCompact={isCompact}
			>
				<AmountCrypto value={wallet.balance()} ticker={wallet.network().ticker()} />
			</TableCell>

			<TableCell
				innerClassName={cn("font-bold", { "space-x-3": isCompact }, { "space-x-4": !isCompact })}
				isCompact={isCompact}
			>
				{hasVotes ? (
					maxVotes === 1 ? (
						<>
							<Avatar size={isCompact ? "xs" : "lg"} address={votes[0].wallet?.address()} noShadow />
							<span>{votes[0].wallet?.username()}</span>
						</>
					) : (
						<div
							className={cn(
								"flex items-center",
								{ "-space-x-1": isCompact },
								{ "-space-x-2": !isCompact },
							)}
						>
							{renderAvatar(first.wallet!.address(), first.wallet!.username())}

							{second && renderAvatar(second.wallet!.address(), second.wallet!.username())}

							{third && renderAvatar(third.wallet!.address(), third.wallet!.username())}

							{rest &&
								rest.length === 1 &&
								renderAvatar(rest[0].wallet!.address(), rest[0].wallet!.username())}

							{rest && rest.length > 1 && renderRestOfVotes(rest.length)}
						</div>
					)
				) : (
					<>
						<Circle
							size={isCompact ? "xs" : "lg"}
							className="border-theme-secondary-300 dark:border-theme-secondary-800"
							noShadow
						/>
						<span className="text-theme-secondary-400">{t("COMMON.NOT_AVAILABLE")}</span>
					</>
				)}
			</TableCell>

			{maxVotes === 1 ? (
				<>
					<TableCell
						innerClassName="justify-center font-bold text-theme-secondary-text"
						isCompact={isCompact}
					>
						{votes[0]?.wallet && <span>#{votes[0].wallet.rank()}</span>}
					</TableCell>

					<TableCell innerClassName="justify-center" isCompact={isCompact}>
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
				<TableCell isCompact={isCompact}>
					<div className="font-bold text-theme-secondary-400">
						<span className="text-theme-secondary-text">{hasVotes ? votes.length : "0"}</span>
						<span>/{maxVotes}</span>
					</div>
				</TableCell>
			)}

			<TableCell variant="end" innerClassName="justify-end" isCompact={isCompact}>
				<Button
					size={isCompact ? "icon" : undefined}
					disabled={!wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()}
					variant={isCompact ? "transparent" : "secondary"}
					className={cn({ "text-theme-primary-600 hover:text-theme-primary-700 -mr-3": isCompact })}
					onClick={() => onSelect?.(wallet.address())}
					data-testid={`AddressRow__select-${index}`}
				>
					{t("COMMON.VOTE")}
				</Button>
			</TableCell>
		</TableRow>
	);
};
