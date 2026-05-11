const DEFAULT_API_URL = 'http://localhost:5000';

type JsonValue = Record<string, unknown>;

async function request<T>(path: string, body: JsonValue): Promise<T> {
  const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'No fue posible completar la solicitud';
    throw new Error(message);
  }

  return data as T;
}

export type AuthResponse = {
  message: string;
  challengeId?: string;
  token?: string;
  resetToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export function requestLoginOtp(email: string, password: string) {
  return request<AuthResponse>('/auth/login/request-otp', { email, password });
}

export function verifyLoginOtp(challengeId: string, otp: string, email: string) {
  return request<AuthResponse>('/auth/login/verify-otp', { challengeId, otp, email });
}

export function requestRegisterOtp(email: string, password: string) {
  return request<AuthResponse>('/auth/register/request-otp', { email, password });
}

export function verifyRegisterOtp(challengeId: string, otp: string, email: string) {
  return request<AuthResponse>('/auth/register/verify-otp', { challengeId, otp, email });
}

export function requestForgotOtp(email: string) {
  return request<AuthResponse>('/auth/forgot-password/request-otp', { email });
}

export function verifyForgotOtp(challengeId: string, otp: string, newPassword?: string, resetToken?: string) {
  return request<AuthResponse>('/auth/forgot-password/verify-otp', { challengeId, otp, newPassword, resetToken });
}