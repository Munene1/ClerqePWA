import { useEffect, useMemo, useState } from "react";
import {
  confirmAccountCreation,
  demoLogin,
  extractApiErrorMessage,
  verifyAccountCreationOtp,
} from "../api/auth";
import type {
  AuthFlowState,
  CustomerSession,
  SignUpFlowState,
} from "../types/auth";
import {
  clearAuthFlowState,
  clearSession,
  loadAuthFlowState,
  loadSession,
  saveAuthFlowState,
  saveSession,
} from "../utils/storage";

type AuthStep = "identifier" | "signup" | "signup_otp";

function getInitialSessionState() {
  const savedSession = loadSession();
  const pendingFlow = loadAuthFlowState();

  if (pendingFlow) {
    return {
      session: savedSession,
      authFlowState: pendingFlow,
      pendingIdentifier: pendingFlow.identifier,
      fullName: pendingFlow.full_name,
      authStep: "signup_otp" as AuthStep,
      authMessage: pendingFlow.message || "Enter the OTP sent to your email.",
    };
  }

  return {
    session: savedSession,
    authFlowState: null as AuthFlowState | null,
    pendingIdentifier: "",
    fullName: "",
    authStep: "identifier" as AuthStep,
    authMessage: null as string | null,
  };
}

export function useBankingSession() {
  const initialState = getInitialSessionState();
  const [session, setSession] = useState<CustomerSession | null>(initialState.session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>(initialState.authStep);
  const [authMessage, setAuthMessage] = useState<string | null>(initialState.authMessage);
  const [fullName, setFullName] = useState(initialState.fullName);
  const [pendingIdentifier, setPendingIdentifier] = useState(initialState.pendingIdentifier);
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState | null>(initialState.authFlowState);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const authenticated = useMemo(() => Boolean(session), [session]);

  async function login(identifier: string) {
    setLoading(true);
    setError(null);
    clearSession();
    clearAuthFlowState();
    setSession(null);
    setAuthFlowState(null);
    setPendingIdentifier(identifier);
    setFullName("");
    setAuthMessage(null);
    setAuthStep("identifier");
    try {
      const result = await demoLogin(identifier);
      if ("status" in result && result.status === "account_not_found") {
        setPendingIdentifier(result.identifier);
        setAuthMessage(result.message);
        setFullName("");
        setAuthStep("signup");
        return;
      }
      const sessionResult = result as CustomerSession;
      clearAuthFlowState();
      setAuthFlowState(null);
      saveSession(sessionResult);
      setSession(sessionResult);
      setPendingIdentifier("");
      setFullName("");
      setAuthMessage(null);
      setAuthStep("identifier");
    } catch (err) {
      setError(extractApiErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function beginAccountCreation(fullName: string) {
    if (!pendingIdentifier) return;
    setLoading(true);
    setError(null);
    try {
      const result = await confirmAccountCreation({
        identifier: pendingIdentifier,
        full_name: fullName,
      });
      if (!result.action_request_id) {
        throw new Error("Account creation could not start. Please try again.");
      }
      const temp: SignUpFlowState = {
        flow: "signup",
        identifier: pendingIdentifier,
        full_name: fullName,
        action_request_id: result.action_request_id,
        challenge_id: result.challenge_id,
        message: result.message,
      };
      saveAuthFlowState(temp);
      setAuthFlowState(temp);
      setFullName(fullName);
      setAuthMessage(result.message || "Enter the OTP sent to your email.");
      setAuthStep("signup_otp");
    } catch (err) {
      setError(extractApiErrorMessage(err, "Unable to start account creation."));
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(otp: string) {
    if (!authFlowState || authFlowState.flow !== "signup") return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifyAccountCreationOtp({
        action_request_id: authFlowState.action_request_id,
        challenge_id: authFlowState.challenge_id,
        otp,
      });

      if ("status" in result) {
        throw new Error("Unexpected signup verification response.");
      }

      clearAuthFlowState();
      setAuthFlowState(null);
      saveSession(result);
      setSession(result);
      setPendingIdentifier("");
      setFullName("");
      setAuthMessage(null);
      setAuthStep("identifier");
    } catch (err) {
      setError(extractApiErrorMessage(err, "OTP verification failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  function cancelAccountCreation() {
    clearAuthFlowState();
    setAuthFlowState(null);
    setAuthStep("identifier");
    setPendingIdentifier("");
    setFullName("");
    setAuthMessage(null);
    setError(null);
  }

  function clearError() {
    setError(null);
  }

  function logout() {
    clearSession();
    clearAuthFlowState();
    setSession(null);
    setAuthFlowState(null);
    setAuthStep("identifier");
    setPendingIdentifier("");
    setFullName("");
    setAuthMessage(null);
  }

  return {
    session,
    authenticated,
    loading,
    error,
    authStep,
    authMessage,
    fullName,
    pendingIdentifier,
    authFlowState,
    login,
    clearError,
    beginAccountCreation,
    submitOtp,
    setFullName,
    cancelAccountCreation,
    logout,
  };
}
