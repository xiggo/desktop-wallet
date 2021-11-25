import * as Sentry from "@sentry/react";
import React from "react";

import { ApplicationError } from "@/domains/error/pages";

export const SentryErrorBoundary = ({ children }: { children: React.ReactNode }) => (
	// @ts-ignore
	<Sentry.ErrorBoundary fallback={(errorData) => <ApplicationError resetErrorBoundary={errorData.resetError} />}>
		{children}
	</Sentry.ErrorBoundary>
);
