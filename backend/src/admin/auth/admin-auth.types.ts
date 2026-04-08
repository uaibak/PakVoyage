export interface AdminTokenPayload {
  username: string;
  exp: number;
}

export interface AdminLoginResponse {
  token: string;
  expires_at: string;
  admin: {
    username: string;
  };
}
