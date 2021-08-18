import LedgerTransportNodeHID from "@ledgerhq/hw-transport-node-hid-singleton";
import React, { createContext, useContext } from "react";

import { useLedgerConnection } from "./hooks/connection";

interface Properties {
	transport: typeof LedgerTransportNodeHID;
	children: React.ReactNode;
}

const LedgerContext = createContext<any>(undefined);

export const LedgerProvider = ({ transport, children }: Properties) => (
	<LedgerContext.Provider value={useLedgerConnection(transport)}>{children}</LedgerContext.Provider>
);

/* istanbul ignore next */
export const useLedgerContext = (): ReturnType<typeof useLedgerConnection> => useContext(LedgerContext);
