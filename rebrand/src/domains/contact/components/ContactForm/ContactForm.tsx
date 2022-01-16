import { Coins } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddressList } from "./ContactForm.blocks";
import { AddressItem, ContactFormProperties, ContactFormState, NetworkOption } from "./ContactForm.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormField, FormLabel, SubForm } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputAddress, InputDefault } from "@/app/components/Input";
import { OptionProperties, Select } from "@/app/components/SelectDropdown";
import { Tooltip } from "@/app/components/Tooltip";
import { useNetworkOptions } from "@/app/hooks";
import { contactForm } from "@/domains/contact/validations/ContactForm";
import { assertNetwork } from "@/utils/assertions";

export const ContactForm: React.VFC<ContactFormProperties> = ({
	profile,
	contact,
	onChange,
	onCancel,
	onDelete,
	onSave,
	errors,
}) => {
	const [addresses, setAddresses] = useState<AddressItem[]>(() =>
		contact
			? contact
					.addresses()
					.values()
					.map((address: Contracts.IContactAddress) => ({
						address: address.address(),
						coin: address.coin(),
						name: contact.name(),
						network: address.network(),
					}))
			: [],
	);

	const { t } = useTranslation();

	const form = useForm<ContactFormState>({
		defaultValues: {
			address: "",
			name: contact?.name() ?? "",
			network: undefined,
		},
		mode: "onChange",
	});

	const { formState, register, setError, setValue, watch, trigger } = form;
	const { isValid } = formState;

	const { name, network, address } = watch();

	const contactFormValidation = contactForm(t, profile);

	useEffect(() => {
		register("network");
	}, [register]);

	useEffect(() => {
		for (const [field, message] of Object.entries(errors) as [keyof ContactFormState, string][]) {
			setError(field, { message, type: "manual" });
		}
	}, [errors, setError]);

	const { networkOptions, networkById } = useNetworkOptions(
		profile.settings().get(Contracts.ProfileSetting.UseTestNetworks),
	);

	const filteredNetworks = useMemo(() => {
		const usedNetworks = new Set(addresses.map((address) => address.network));
		return networkOptions.filter(({ value }: NetworkOption) => !usedNetworks.has(value));
	}, [addresses, networkOptions]);

	const handleAddAddress = async () => {
		assertNetwork(network);
		const instance: Coins.Coin = profile.coins().set(network.coin(), network.id());
		await instance.__construct();
		const isValidAddress: boolean = await instance.address().validate(address);

		if (!isValidAddress) {
			return setError("address", { message: t("CONTACTS.VALIDATION.ADDRESS_IS_INVALID"), type: "manual" });
		}

		const duplicateAddress = profile.contacts().findByAddress(address);

		if (duplicateAddress.length > 0) {
			return setError("address", { message: t("CONTACTS.VALIDATION.CONTACT_ADDRESS_EXISTS"), type: "manual" });
		}

		setAddresses([
			...addresses,
			{
				address,
				coin: network.coin(),
				name: address,
				network: network.id(),
			},
		]);

		setValue("network", undefined);
		setValue("address", "");
	};

	const handleRemoveAddress = (item: AddressItem) => {
		setAddresses(
			addresses.filter((current) => !(current.address === item.address && current.network === item.network)),
		);
	};

	const handleSelectNetwork = (networkOption?: NetworkOption) => {
		setValue("network", networkById(networkOption?.value), { shouldDirty: true, shouldValidate: true });
		trigger("address");
	};

	const renderNetworkLabel = (option: OptionProperties) => (
		<div className="flex justify-between">
			<span>{option.label}</span>
			{(option as NetworkOption).isTestNetwork && (
				<Tooltip content={t("COMMON.TEST_NETWORK")}>
					<span>
						<Icon
							className="text-theme-secondary-500 dark:text-theme-secondary-700"
							name="Code"
							size="lg"
						/>
					</span>
				</Tooltip>
			)}
		</div>
	);

	return (
		<Form
			data-testid="contact-form"
			context={form}
			onSubmit={() =>
				onSave({
					addresses,
					name,
				})
			}
		>
			<FormField name="name">
				<FormLabel>{t("CONTACTS.CONTACT_FORM.NAME")}</FormLabel>
				<InputDefault
					data-testid="contact-form__name-input"
					ref={register(contactFormValidation.name(contact?.id()))}
					onChange={() => onChange("name")}
					defaultValue={contact?.name()}
				/>
			</FormField>

			<SubForm>
				<FormField name="network">
					<FormLabel>{t("CONTACTS.CONTACT_FORM.CRYPTOASSET")}</FormLabel>
					<Select
						placeholder={t("COMMON.INPUT_NETWORK.PLACEHOLDER")}
						defaultValue={network?.id()}
						options={filteredNetworks}
						onChange={(networkOption) => handleSelectNetwork(networkOption as NetworkOption)}
						renderLabel={renderNetworkLabel}
					/>
				</FormField>

				<FormField name="address" data-testid="ContactForm__address">
					<FormLabel>{t("CONTACTS.CONTACT_FORM.ADDRESS")}</FormLabel>

					<InputAddress
						profile={profile}
						useDefaultRules={false}
						registerRef={register}
						onChange={() => onChange("address")}
						data-testid="contact-form__address-input"
					/>
				</FormField>

				<div className="mt-4">
					<Button
						data-testid="contact-form__add-address-btn"
						variant="secondary"
						className="w-full"
						disabled={!network || !address}
						onClick={handleAddAddress}
					>
						{t("CONTACTS.CONTACT_FORM.ADD_ADDRESS")}
					</Button>
				</div>
			</SubForm>

			{addresses.length > 0 && <AddressList addresses={addresses} onRemove={handleRemoveAddress} />}

			<div
				className={`flex w-full pt-8 border-t border-theme-secondary-300 dark:border-theme-secondary-800 ${
					contact ? "justify-between" : "justify-end"
				}`}
			>
				{contact && (
					<Button data-testid="contact-form__delete-btn" onClick={onDelete} variant="danger">
						<Icon name="Trash" />
						<span>{t("CONTACTS.CONTACT_FORM.DELETE_CONTACT")}</span>
					</Button>
				)}

				<div className="space-x-3">
					<Button data-testid="contact-form__cancel-btn" variant="secondary" onClick={onCancel}>
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						data-testid="contact-form__save-btn"
						type="submit"
						variant="primary"
						disabled={addresses.length === 0 || !isValid}
					>
						{t("COMMON.SAVE")}
					</Button>
				</div>
			</div>
		</Form>
	);
};
