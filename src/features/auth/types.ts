export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: number;
  email: string | null;
  emailVerified: boolean;
  profileName: string | null;
  profilePhotoUrl: string | null;
  profileBio: string | null;
  telegramId: string | null;
  telegramUsername: string | null;
  telegramName: string | null;
  telegramPhotoUrl: string | null;
  telegramVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  role: string;
  status: string;
  createdAt?: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
  refreshToken: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  loading: boolean;
  error: string | null;
};

export type MeResponse = { user: AuthUser } | AuthUser;
