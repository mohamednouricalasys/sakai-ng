export interface AdminUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    enabled: boolean;
    createdTimestamp?: number;
    roles: string[];
    fullName?: string;
}

export interface PaginatedAdminUsers {
    items: AdminUser[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ImpersonatedUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    fullName?: string;
}

export interface ImpersonationResult {
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
    errorMessage?: string;
    redirectUrl?: string;
    requiresRedirect?: boolean;
    impersonatedUser?: ImpersonatedUser;
    originalUserId?: string;
}

export interface ImpersonationState {
    isImpersonating: boolean;
    originalToken?: string;
    originalUserId?: string;
    impersonatedUser?: ImpersonatedUser;
}
