import { Contracts } from "@payvo/profiles";
import { Button } from "app/components/Button";
import { EmptyBlock } from "app/components/EmptyBlock";
import { Header } from "app/components/Header";
import { HeaderSearchBar } from "app/components/Header/HeaderSearchBar";
import { Page, Section } from "app/components/Layout";
import { Table } from "app/components/Table";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { useEnvironmentContext } from "app/contexts";
import { useActiveProfile, useNetworkOptions } from "app/hooks";
import { CreateContact, DeleteContact, UpdateContact } from "domains/contact/components";
import { ContactListItem } from "domains/contact/components/ContactListItem";
import querystring from "querystring";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { assertNetwork } from "utils/assertions";

interface ContactsHeaderExtraProperties {
	showSearchBar: boolean;
	onSearch?: any;
	onAddContact?: any;
}

const ContactsHeaderExtra = ({ showSearchBar, onSearch, onAddContact }: ContactsHeaderExtraProperties) => {
	const { t } = useTranslation();

	return (
		<div className="flex justify-end items-top">
			{showSearchBar && (
				<div className="flex items-center space-x-5 text-theme-primary-200">
					<HeaderSearchBar onSearch={onSearch} />
					<div className="pl-8 my-auto ml-8 h-10 border-l border-theme-secondary-300 dark:border-theme-secondary-800" />
				</div>
			)}

			<Button data-testid="contacts__add-contact-btn" className="whitespace-nowrap" onClick={onAddContact}>
				{t("CONTACTS.CONTACTS_PAGE.ADD_CONTACT")}
			</Button>
		</div>
	);
};

export const Contacts = () => {
	const { state } = useEnvironmentContext();

	const history = useHistory();

	const activeProfile = useActiveProfile();
	const { networkById } = useNetworkOptions();

	const [query, setQuery] = useState<string>("");

	const useTestNetworks = activeProfile.settings().get<boolean>(Contracts.ProfileSetting.UseTestNetworks) || false;

	const contacts: Contracts.IContact[] = useMemo(() => {
		const contacts = activeProfile.contacts().values();

		if (useTestNetworks) {
			return contacts;
		}

		return contacts.filter((contact) =>
			contact
				.addresses()
				.values()
				.some((address) => {
					const network = networkById(address.network());
					assertNetwork(network);
					return network.isLive();
				}),
		);
	}, [activeProfile, networkById, useTestNetworks, state]); // eslint-disable-line react-hooks/exhaustive-deps

	const filteredContacts = useMemo(() => {
		if (query.length === 0) {
			return contacts;
		}

		const networkMap: Record<string, boolean> = {};

		return contacts.filter((contact) => {
			const identifiers = [contact.name().toLowerCase()];

			for (const address of contact.addresses().values()) {
				if (networkMap[address.network()] === undefined) {
					const network = networkById(address.network());
					assertNetwork(network);
					networkMap[address.network()] = network.isLive();
				}

				const isLive = networkMap[address.network()];

				if (isLive || (useTestNetworks && !isLive)) {
					identifiers.push(address.address().toLowerCase());
				}
			}

			for (const identifier of identifiers) {
				if (identifier.includes(query.toLowerCase())) {
					return true;
				}
			}

			return false;
		});
	}, [contacts, networkById, useTestNetworks, query]);

	const [createIsOpen, setCreateIsOpen] = useState(false);

	const [contactAction, setContactAction] = useState<string | null>(null);
	const [selectedContact, setSelectedContact] = useState<Contracts.IContact | null>(null);

	const { t } = useTranslation();

	useEffect(() => {
		if (!contactAction) {
			setSelectedContact(null);
		}
	}, [contactAction]);

	const contactOptions = [
		{ label: t("COMMON.EDIT"), value: "edit" },
		{ label: t("COMMON.DELETE"), value: "delete" },
	];

	const listColumns: TableColumn[] = [
		{
			Header: t("COMMON.NAME"),
			accessor: "name",
		},
		{
			Header: t("COMMON.CRYPTOASSET"),
			className: "justify-center",
			minimumWidth: true,
		},
		{
			Header: t("COMMON.ADDRESS"),
		},
		{
			Header: t("COMMON.COPY"),
			minimumWidth: true,
		},
		{
			Header: "Actions",
			className: "hidden no-border",
			minimumWidth: true,
		},
	];

	const handleContactAction = (action: string, contact: Contracts.IContact) => {
		setContactAction(action);
		setSelectedContact(contact);
	};

	const handleSend = (address: Contracts.IContactAddress) => {
		const schema = { coin: address.coin(), network: address.network(), recipient: address.address() };
		const queryParameters = querystring.encode(schema);
		const url = `/profiles/${activeProfile.id()}/send-transfer?${queryParameters}`;

		history.push(url);
	};

	const resetContactAction = () => {
		setContactAction(null);
	};

	return (
		<>
			<Page>
				<Section border>
					<Header
						title={t("CONTACTS.CONTACTS_PAGE.TITLE")}
						subtitle={t("CONTACTS.CONTACTS_PAGE.SUBTITLE")}
						extra={
							<ContactsHeaderExtra
								showSearchBar={contacts.length > 0}
								onSearch={setQuery}
								onAddContact={() => setCreateIsOpen(true)}
							/>
						}
					/>
				</Section>

				<Section>
					{contacts.length === 0 ? (
						<EmptyBlock>{t("CONTACTS.CONTACTS_PAGE.EMPTY_MESSAGE")}</EmptyBlock>
					) : (
						<>
							{filteredContacts.length > 0 ? (
								<div className="w-full" data-testid="ContactList">
									<Table columns={listColumns} data={filteredContacts}>
										{(contact: Contracts.IContact) => (
											<ContactListItem
												item={contact}
												options={contactOptions}
												onSend={handleSend}
												onAction={(action: { value: any }) =>
													handleContactAction(action.value, contact)
												}
												useTestNetworks={useTestNetworks}
											/>
										)}
									</Table>
								</div>
							) : (
								<EmptyBlock data-testid="Contacts--empty-results">
									{t("CONTACTS.CONTACTS_PAGE.NO_CONTACTS_FOUND", { query })}
								</EmptyBlock>
							)}
						</>
					)}
				</Section>
			</Page>

			<CreateContact
				isOpen={createIsOpen}
				profile={activeProfile}
				onCancel={() => setCreateIsOpen(false)}
				onClose={() => setCreateIsOpen(false)}
				onSave={() => setCreateIsOpen(false)}
			/>

			{selectedContact && (
				<>
					<UpdateContact
						isOpen={contactAction === "edit"}
						contact={selectedContact}
						profile={activeProfile}
						onCancel={resetContactAction}
						onClose={resetContactAction}
						onDelete={() => setContactAction("delete")}
						onSave={resetContactAction}
					/>

					<DeleteContact
						isOpen={contactAction === "delete"}
						contact={selectedContact}
						profile={activeProfile}
						onCancel={resetContactAction}
						onClose={resetContactAction}
						onDelete={resetContactAction}
					/>
				</>
			)}
		</>
	);
};
