export interface FileItem {
    id: string;
    uniqeIdnetifier?: string; // Unique filename with GUID for storage
    uniqueFilename?: string; // Unique filename with GUID for storage
    name: string; // Original filename for display
    url?: string;
    uploading: boolean;
    progress: number;
    size: number;
    contentType?: string;
    uploadDate?: Date;
    metadata?: Record<string, any>;
}
