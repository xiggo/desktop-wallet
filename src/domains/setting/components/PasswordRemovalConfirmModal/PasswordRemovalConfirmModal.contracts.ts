export interface Properties {
	onCancel: () => void;
	onConfirm: (currentPassword: string) => void;
}

export interface FormState {
	currentPassword: string;
}
