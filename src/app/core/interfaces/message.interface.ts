export interface Message {
    id: string;
    sender?: string;
    subject?: string;
    content?: string;
    timestamp?: Date;
    read?: boolean;
}
