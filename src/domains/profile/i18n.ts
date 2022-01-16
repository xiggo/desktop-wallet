export const translations = {
	CREATE_PROFILE: "Create Profile",
	IMPORT: {
		ERROR_STEP: {
			DESCRIPTION:
				"An error occurred while importing the profile, try importing again. Select Retry to re-import the profile. If the error occurs again, you can contact our support team.",
		},
		FORM_STEP: {
			DESCRIPTION: "Your profile addresses have been imported.",
		},

		PASSWORD_DESCRIPTION:
			"The profile you are importing contains a password that has been set for security purposes. Enter the password to confirm.",
		PASSWORD_TITLE: "Profile Password",
		PROCESSING_IMPORT_STEP: {
			DESCRIPTION: "The file with name {{name}} is being imported.",
			PLEASE_WAIT: "Please wait...",
		},
		SELECT_FILE_STEP: {
			BROWSE_FILES: "Browse Files",
			CLICK_HERE: "Click here.",
			DEPRECATION_WARNING:
				"Please note that importing a Profile from Desktop Wallet v2 in .json format is supported temporarily and will soon be disabled. We recommend that you re-save your Profile in the new .dwe format.",
			DESCRIPTION:
				"Select a {{fileFormat}} file with your Profile and related properties to start the import process.",
			DRAG_AND_DROP: "Drag & Drop or",
			ERRORS: {
				NOT_SUPPORTED:
					"This file type is not supported.\nPlease retry with a <strong>{{fileFormat}}</strong> file.",
				TOO_MANY: "You tried to import <strong>{{fileCount}}</strong> files.\nPlease retry with one file only.",
			},
			LEGACY_IMPORT: "Importing from Desktop Wallet v2?",
			SUPPORTED_FORMAT: "Supported format is {{fileFormat}}",
			UPLOAD_TITLE: "Click here to upload",
		},
		TITLE: "Import Profile",
	},
	MODAL_DELETE_PROFILE: {
		DESCRIPTION: "Do you really want to delete this profile? Once deleted, you will not be able to restore it.",
		TITLE: "Delete Profile",
	},
	MODAL_HISTORY: {
		TITLE: "History",
		TYPES: {
			REGISTRATION: "Registration",
			RESIGN: "Resign",
			UPDATE: "Update",
		},
	},
	MODAL_RESET_PROFILE: {
		DESCRIPTION:
			"By performing this action, all of your Profile settings will be restored to default. This won't delete your wallets or plugins. This action cannot be undone. Do you want to reset your settings?",
		SUCCESS: "Your profile has been reset successfully",
		TITLE: "Reset Profile Settings",
	},
	MODAL_SELECT_SENDER: {
		DESCRIPTION: "Find and select the sender from your wallets",
		SEARCH_PLACEHOLDER: "Enter name or address",
		TITLE: "Select Sender",
	},
	MODAL_SIGN_IN: {
		DESCRIPTION: "Sign in to access your Profile.",
		MAX_ATTEMPTS_ERROR:
			"Maximum sign in attempts reached - please wait {{remainingTime}} seconds before trying again.",
		TITLE: "Sign In",
	},
	MODAL_WELCOME: {
		DONT_SHOW_CHECKBOX_LABEL: "Don't show this quick tour again.",
		STEP_1_DESCRIPTION:
			"Start a quick tour to learn how to get the most out of the Solar Wallet, or skip it to go directly to your profile.",
		STEP_1_TITLE: "Welcome to Solar Wallet",
		STEP_2_DESCRIPTION:
			"Create or import existing wallets from a broad range of assets and secure them using industry-standard encryption.",
		STEP_2_TITLE: "Manage Your Assets",
		STEP_3_DESCRIPTION:
			"Solar lets you extend your wallet’s functionality with a growing collection of Games, Utilities and more.",
		STEP_3_TITLE: "Enhance Your Experience With Plugins",
		STEP_4_DESCRIPTION: "With Solar, you’re in control. Swap assets effortlessly without ever leaving your wallet.",
		STEP_4_TITLE: "Exchange Assets On The Fly",
		STEP_5_DESCRIPTION:
			"Customize or search your news feed to view the latest updates on your favorite cryptoassets.",
		STEP_5_TITLE: "Stay Up To Date",
	},
	PAGE_CREATE_PROFILE: {
		DESCRIPTION: "Create a new Profile below.",
		TITLE: "Create Profile",
		VALIDATION: {
			NAME_EXISTS: "A profile with this name already exists",
		},
	},
	PAGE_WELCOME: {
		HAS_EXPORTED_PROFILES: "Exported a Profile before?",
		IMPORT_PROFILE: "Import it here.",
		IMPORT_PROFILE_TITLE: "Import Profile",
		WITHOUT_PROFILES: {
			DESCRIPTION: "Create a new Profile to get started.",
			TITLE: "Create Profile",
		},
		WITH_PROFILES: {
			DESCRIPTION: "Choose from an existing Profile below or create a new Profile to get started.",
			TITLE: "Select Profile",
		},
	},
};
