import { Networks } from "@payvo/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AddressListItemProperties, AddressListProperties } from "./ContactForm.contracts";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useEnvironmentContext } from "@/app/contexts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";

const AddressListItem: React.VFC<AddressListItemProperties> = ({ address, onRemove }) => {
	const { env } = useEnvironmentContext();

	const network = useMemo(
		() =>
			env
				.availableNetworks()
				.find(
					(network: Networks.Network) => network.coin() === address.coin && network.id() === address.network,
				),
		[address, env],
	);

	return (
		<div
			data-testid="contact-form__address-list-item"
			className="flex items-center py-4 border-b border-dashed last:pb-0 last:border-b-0 border-theme-secondary-300 dark:border-theme-secondary-800"
		>
			<div className="mr-4">
				<div className="flex items-center -space-x-1">
					<NetworkIcon network={network} size="lg" />
					<Avatar address={address.address} size="lg" />
				</div>
			</div>

			<span className="font-semibold">
				<Address address={address.address} />
			</span>

			<Button
				data-testid="contact-form__remove-address-btn"
				size="icon"
				className="flex items-center ml-auto"
				variant="danger"
				onClick={() => onRemove()}
			>
				<Icon name="Trash" />
			</Button>
		</div>
	);
};

export const AddressList: React.VFC<AddressListProperties> = ({ addresses, onRemove }) => {
	const { t } = useTranslation();

	return (
		<div className="group">
			<span className="inline-block text-sm font-semibold transition-colors duration-100 text-theme-secondary-text group-hover:text-theme-primary-600">
				{t("CONTACTS.CONTACT_FORM.ADDRESSES")}
			</span>

			<div data-testid="contact-form__address-list">
				{addresses.map((address, index) => (
					<AddressListItem key={index} address={address} onRemove={() => onRemove(address)} />
				))}
			</div>
		</div>
	);
};
