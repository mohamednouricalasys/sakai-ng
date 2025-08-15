export interface FileItem {
    id: string;
    name: string; // Original filename for display
    uniqueFilename?: string; // Unique filename with GUID for storage
    size: number;
    uploading: boolean;
    progress: number;
    url?: string;
    contentType?: string;
    uploadDate?: Date;
    metadata?: Record<string, any>;
}
