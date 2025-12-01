export interface UserCreditDetailsDto {
    totalCredits: number;
    monthlyAllocation: number;
    oneTimeCredits: number;
    lastRenewalDate: string; // ISO date string
    nextRenewalDate: string; // ISO date string
    recentTransactions: Transaction[];
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'usage' | 'subscription_recreate' | 'subscription_renewal' | string;
    description: string;
    transactionDate: string; // ISO date string
    balanceAfter: number;
}
