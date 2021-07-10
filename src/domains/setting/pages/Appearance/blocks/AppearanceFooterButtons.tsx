import { Button } from "app/components/Button";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

interface Properties {
	isSaveDisabled: boolean;
}

export const AppearanceFooterButtons: React.FC<Properties> = ({ isSaveDisabled }: Properties) => {
	const { t } = useTranslation();

	const history = useHistory();

	return (
		<div className="flex justify-end mt-8 space-x-3 w-full">
			<Button data-testid="AppearanceFooterButtons__cancel" variant="secondary" onClick={() => history.go(-1)}>
				{t("COMMON.CANCEL")}
			</Button>

			<Button
				data-testid="AppearanceFooterButtons__save"
				disabled={isSaveDisabled}
				type={isSaveDisabled ? "button" : "submit"}
			>
				{t("COMMON.SAVE")}
			</Button>
		</div>
	);
};
