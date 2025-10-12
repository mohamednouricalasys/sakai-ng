export interface UserSubscription {
    string: string;
    status: string;
    createdAt: string;
    plan: string;
    credits: number;
    canceledAt: Date;
}
