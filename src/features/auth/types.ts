export type LoginPayload = {
  username: string;
  password: string;
};

export type AdminMe = {
  id?: number | string;
  username: string;
  fullName?: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminMe | null;

  loading: boolean;
  error: string | null;
};

export type MeResponse = { admin: AdminMe } | AdminMe;
