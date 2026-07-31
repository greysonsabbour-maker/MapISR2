export type UserRole = 'admin' | 'viewer';

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
}

export interface AuthCredentials {
  password: string;
  role: UserRole;
  displayName: string;
}

export const AUTH_CREDENTIALS: Record<string, AuthCredentials> = {
  donut: { password: 'donut', role: 'admin', displayName: 'Administrator' },
  railfan: { password: 'railfan', role: 'viewer', displayName: 'Railfan' },
  dispatcher: { password: 'dispatcher', role: 'viewer', displayName: 'Dispatcher' },
  freight: { password: 'freight', role: 'viewer', displayName: 'Freight Viewer' },
  mainline: { password: 'mainline', role: 'viewer', displayName: 'Mainline Viewer' },
  cabride: { password: 'cabride', role: 'viewer', displayName: 'Cab Ride Viewer' },
};

export const SESSION_KEY = 'mapisr_session';
