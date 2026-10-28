/** Adapter reads authoritative time inside the caller's owned transaction after required locks. */
export interface SessionClock {
 now(): Promise<Date>;
}

/** Adapter owns credential encoding, KDF cost and dummy-user work; never log either input. */
export interface PasswordVerifier {
 verify(password: string, storedCredential: string): Promise<boolean>;
}
