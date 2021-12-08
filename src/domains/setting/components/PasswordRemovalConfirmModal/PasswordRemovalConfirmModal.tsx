import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { PasswordRemovalFormState, PasswordRemovalProperties } from "./PasswordRemovalConfirmModal.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { InputPassword } from "@/app/components/Input";
import { Modal } from "@/app/components/Modal";

export const PasswordRemovalConfirmModal: React.FC<PasswordRemovalProperties> = ({ onCancel, onConfirm }) => {
	const { t } = useTranslation();

	const form = useForm<PasswordRemovalFormState>({
		defaultValues: {
			currentPassword: "",
		},
		mode: "onChange",
	});

	const { formState, register } = form;
	const { isDirty, isValid } = formState;

	const submit: SubmitHandler<PasswordRemovalFormState> = ({ currentPassword }) => {
		onConfirm(currentPassword);
	};

	return (
		<Modal
			isOpen
			title={t("SETTINGS.PASSWORD.REMOVAL.TITLE")}
			description={t("SETTINGS.PASSWORD.REMOVAL.DESCRIPTION")}
			image={<Image name="GenericWarning" className="my-8 mx-auto" />}
			onClose={onCancel}
		>
			<Form onSubmit={submit} context={form} className="space-y-8 mt-8">
				<FormField name="currentPassword">
					<FormLabel label={t("SETTINGS.PASSWORD.REMOVAL.PROFILE_PASSWORD")} />
					<InputPassword
						data-testid="PasswordRemovalConfirmModal__input-password"
						ref={register({
							required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
								field: t("SETTINGS.PASSWORD.CURRENT"),
							}).toString(),
						})}
					/>
				</FormField>

				<div className="flex justify-end w-full space-x-3">
					<Button data-testid="PasswordRemovalConfirmModal__cancel" onClick={onCancel} variant="secondary">
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						data-testid="PasswordRemovalConfirmModal__confirm"
						variant="danger"
						className="flex space-x-2"
						disabled={isDirty ? !isValid : true}
						type="submit"
					>
						<Icon name="Trash" />
						<span>{t("COMMON.REMOVE")}</span>
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
