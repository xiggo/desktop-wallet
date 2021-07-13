import { Contracts } from "@payvo/profiles";

type AccentColorType = "green" | "blue";

const ACCENT_BLUE_CLASS = "accent-blue"; // defined in variables.css

const useAccentColor = () => {
	const getCurrentAccentColor = (): AccentColorType => {
		if (document.body.classList.contains(ACCENT_BLUE_CLASS)) {
			return "blue";
		}

		return "green";
	};

	const setAccentColor = (value: AccentColorType) => {
		if (value === "blue") {
			document.body.classList.add(ACCENT_BLUE_CLASS);
		}

		if (value === "green") {
			document.body.classList.remove(ACCENT_BLUE_CLASS);
		}
	};

	const setProfileAccentColor = (profile: Contracts.IProfile) => {
		const profileAccentColor = profile.settings().get(Contracts.ProfileSetting.AccentColor);

		/* istanbul ignore else */
		if (getCurrentAccentColor() !== profileAccentColor) {
			setAccentColor(profileAccentColor as AccentColorType);
		}
	};

	return {
		getCurrentAccentColor,
		setAccentColor,
		setProfileAccentColor,
	};
};

export { useAccentColor };

export type { AccentColorType };
