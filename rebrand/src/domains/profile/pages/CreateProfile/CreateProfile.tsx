import { Contracts, Helpers } from "@payvo/sdk-profiles";
import LocaleCurrency from "locale-currency";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Form, FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { InputDefault, InputPassword } from "@/app/components/Input";
import { Page, Section } from "@/app/components/Layout";
import { ListDivided } from "@/app/components/ListDivided";
import { Select } from "@/app/components/SelectDropdown";
import { SelectProfileImage } from "@/app/components/SelectProfileImage";
import { Toggle } from "@/app/components/Toggle";
import { useEnvironmentContext } from "@/app/contexts";
import { useProfileRestore, useTheme, useValidation } from "@/app/hooks";
import { useCurrencyOptions } from "@/app/hooks/use-currency-options";
import { DEFAULT_MARKET_PROVIDER } from "@/domains/profile/data";
import { setThemeSource } from "@/utils/electron-utils";

export const CreateProfile = () => {
	const { env, persist } = useEnvironmentContext();
	const form = useForm({ mode: "onChange" });
	const history = useHistory();
	const { t } = useTranslation();
	const { restoreProfileConfig } = useProfileRestore();

	const currencyOptions = useCurrencyOptions(DEFAULT_MARKET_PROVIDER);

	const { watch, register, formState, setValue, trigger } = form;
	const { name, confirmPassword, isDarkMode, password } = watch(
		["name", "confirmPassword", "isDarkMode", "password"],
		{ name: "" },
	);

	const [avatarImage, setAvatarImage] = useState("");

	const { theme, setTheme } = useTheme();
	const { createProfile, password: passwordValidation } = useValidation();

	const formattedName = name.trim();

	const isSvg = useMemo(() => avatarImage.endsWith("</svg>"), [avatarImage]);

	useEffect(() => {
		if (!formattedName && isSvg) {
			setAvatarImage("");
		}
	}, [formattedName, isSvg, setAvatarImage]);

	useEffect(() => {
		if (confirmPassword) {
			trigger("confirmPassword");
		}
	}, [password, trigger]); // eslint-disable-line react-hooks/exhaustive-deps

	useLayoutEffect(() => {
		if (theme === "dark") {
			setValue("isDarkMode", true);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const newTheme = isDarkMode ? "dark" : "light";

		document.body.classList.remove(`theme-${theme}`);
		document.body.classList.add(`theme-${newTheme}`);

		setThemeSource(newTheme);
	}, [isDarkMode, theme]);

	const otherItems = [
		{
			isFloatingLabel: true,
			label: t("SETTINGS.GENERAL.OTHER.DARK_THEME.TITLE"),
			labelAddon: <Toggle ref={register()} name="isDarkMode" />,
			labelClass: "text-xl font-semibold",
			labelDescription: t("SETTINGS.GENERAL.OTHER.DARK_THEME.DESCRIPTION"),
		},
	];

	const handleSubmit = async ({ name, password, currency, isDarkMode }: any) => {
		const profile = env.profiles().create(name.trim());
		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, currency);
		profile.settings().set(Contracts.ProfileSetting.Theme, isDarkMode ? "dark" : "light");

		profile.settings().set(Contracts.ProfileSetting.Avatar, avatarImage);

		if (password) {
			profile.auth().setPassword(password);
		}

		restoreProfileConfig(profile);
		await persist();

		history.push("/");
	};

	const defaultCurrency = useMemo(() => {
		const locale = Intl.DateTimeFormat().resolvedOptions().locale;
		const currency = LocaleCurrency.getCurrency(locale);

		if (
			currencyOptions[0].options.some(
				(option) => (option.value as string).toLowerCase() === currency.toLowerCase(),
			)
		) {
			return currency;
		}

		return "USD";
	}, [currencyOptions]);

	return (
		<Page navbarVariant="logo-only" title={t("COMMON.PAYVO_WALLET")}>
			<Section className="flex flex-col flex-1 justify-center">
				<div className="mx-auto max-w-lg">
					<Header
						title={t("PROFILE.PAGE_CREATE_PROFILE.TITLE")}
						subtitle={t("PROFILE.PAGE_CREATE_PROFILE.DESCRIPTION")}
					/>

					<Form
						className="p-10 mt-10 rounded-lg border bg-theme-background border-theme-secondary-300 dark:border-theme-secondary-800"
						context={form}
						onSubmit={handleSubmit}
						data-testid="CreateProfile__form"
					>
						<div className="relative space-y-5">
							<div className="flex justify-between items-end">
								<div className="mr-6 w-full">
									<FormField name="name">
										<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.NAME")} />
										<InputDefault
											ref={register(createProfile.name())}
											onBlur={() => {
												/* istanbul ignore else */
												if (!avatarImage || isSvg) {
													setAvatarImage(
														formattedName ? Helpers.Avatar.make(formattedName) : "",
													);
												}
											}}
										/>
									</FormField>
								</div>

								<SelectProfileImage
									value={avatarImage}
									name={formattedName}
									showLabel={false}
									onSelect={(image) => {
										if (!image) {
											setAvatarImage(formattedName ? Helpers.Avatar.make(formattedName) : "");
											return;
										}

										setAvatarImage(image);
									}}
								/>
							</div>

							<FormField name="password">
								<FormLabel
									label={t("SETTINGS.GENERAL.PERSONAL.PASSWORD")}
									optional={!password && !confirmPassword}
								/>
								<InputPassword ref={register(passwordValidation.password())} />
							</FormField>

							<FormField name="confirmPassword">
								<FormLabel
									label={t("SETTINGS.GENERAL.PERSONAL.CONFIRM_PASSWORD")}
									optional={!password && !confirmPassword}
								/>
								<InputPassword ref={register(passwordValidation.confirmOptionalPassword(password))} />
							</FormField>

							<FormField name="currency">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.CURRENCY")} />
								<Select
									id="select-currency"
									placeholder={t("COMMON.SELECT_OPTION", {
										option: t("SETTINGS.GENERAL.PERSONAL.CURRENCY"),
									})}
									ref={register(createProfile.currency())}
									options={currencyOptions}
									defaultValue={defaultCurrency}
									onChange={(currency: any) =>
										setValue("currency", currency?.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
								/>
							</FormField>
						</div>

						<div className="pb-4 mt-8">
							<ListDivided items={otherItems} />
						</div>

						<Divider />

						<div className="flex justify-end pt-4 space-x-3">
							<Button
								variant="secondary"
								onClick={() => {
									setTheme("system");
									history.push("/");
								}}
							>
								{t("COMMON.BACK")}
							</Button>

							<Button
								disabled={!formState.isValid}
								type="submit"
								data-testid="CreateProfile__submit-button"
							>
								{t("COMMON.CREATE")}
							</Button>
						</div>
					</Form>
				</div>
			</Section>
		</Page>
	);
};
