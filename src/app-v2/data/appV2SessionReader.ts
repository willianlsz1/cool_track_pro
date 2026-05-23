export interface AppV2SessionUser {
  id: string;
  email?: string | null;
}

export interface AppV2SessionReader {
  getCurrentUser(): Promise<AppV2SessionUser | null>;
}
