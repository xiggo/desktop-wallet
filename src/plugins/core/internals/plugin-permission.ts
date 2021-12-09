import { Contracts } from "@payvo/sdk-profiles";

import { IPluginController, IPluginServiceData } from "@/plugins/core";

interface MiddlewareContext {
	profile: Contracts.IProfile;
	plugin: IPluginController;
	service?: IPluginServiceData;
}

type Rule<T = any> = (context: MiddlewareContext) => (result: T) => T | never;

export const isServiceDefinedInConfig: Rule =
	({ service, plugin }) =>
	(result) => {
		if (!!service && plugin.config().permissions()?.includes(service.id())) {
			return result;
		}
		return console.error.bind(
			console,
			`The plugin ${plugin.config().name()} did not define ${service?.id()} its permissions.`,
		);
	};

const result = (result) => result;
export const isServiceEnabled: Rule = () => result;

export const isPluginEnabled: Rule =
	({ profile, plugin }) =>
	(result) => {
		if (plugin.isEnabled(profile)) {
			return result;
		}

		return console.error.bind(
			console,
			`The plugin ${plugin.config().name()} is not enabled by the current profile.`,
		);
	};

export const applyPluginMiddlewares = (context: MiddlewareContext, rules: Rule[]) => (response: any) => {
	let transformedResponse = response;

	for (const rule of rules) {
		transformedResponse = rule(context)(transformedResponse);
	}

	return transformedResponse;
};
