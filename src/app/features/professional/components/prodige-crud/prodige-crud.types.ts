import { Prodige } from '../../../../core/interfaces/prodige.interface';

export interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

export interface ExportColumn {
    title: string;
    dataKey: string;
}

export interface ProdigeStoreState {
    prodigies: Prodige[];
    loading: boolean;
    saving: boolean;
    deleting: boolean;
    error: string | null;
    lastUpdated: Date | null;
}
