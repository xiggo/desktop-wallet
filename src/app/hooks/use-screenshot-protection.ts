import { Contracts } from "@payvo/sdk-profiles";

import { setScreenshotProtection } from "@/utils/electron-utils";

const setProfileScreenshotProtection = (profile: Contracts.IProfile) => {
	setScreenshotProtection(profile.settings().get(Contracts.ProfileSetting.ScreenshotProtection) === true);
};

export const useScreenshotProtection = () => ({ setScreenshotProtection: setProfileScreenshotProtection });
