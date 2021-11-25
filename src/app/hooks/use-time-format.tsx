import { Contracts } from "@payvo/sdk-profiles";
import { useHistory } from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts";

import { useProfileUtils } from "./use-profile-utils";

export const useTimeFormat = () => {
	const { env } = useEnvironmentContext();
	const { getProfileFromUrl } = useProfileUtils(env);
	const history = useHistory();

	const defaultFormat = "DD.MM.YYYY h:mm A";

	const profile = getProfileFromUrl(history?.location.pathname);

	if (!profile) {
		return defaultFormat;
	}

	const timeFormat = profile.settings().get<string>(Contracts.ProfileSetting.TimeFormat);

	return timeFormat ? defaultFormat.replace("h:mm A", timeFormat) : defaultFormat;
};
