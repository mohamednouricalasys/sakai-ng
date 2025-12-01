import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { Sport } from '../../../../core/enums/sport.enum';
import { Tag } from '../../../../core/enums/tag.enum';
import { Genre } from '../../../../core/enums/gender.enum';
import { Country } from '../../../../core/interfaces/country.interface';
import { ExportColumn } from './prodige-crud.types';

export function normalizeProdige(prodige: Prodige): Prodige {
    return {
        ...prodige,
        videos: prodige.videos || [],
        tags: prodige.tags || [],
        dateCreation: prodige.dateCreation || new Date(),
        description: prodige.description || '',
        pays: prodige.pays || 'FR',
    };
}

export function getGenderIcon(gender: Genre) {
    return gender === Genre.Homme ? 'pi pi-mars' : 'pi pi-venus';
}

export function formatCSV(
    data: Prodige[],
    exportColumns: ExportColumn[],
    getLabelFns: {
        sportLabel: (sport: Sport) => string;
        genderLabel: (gender: Genre) => string;
        countryName: (code: string) => string;
        tagLabel: (tag: Tag) => string;
    },
) {
    const headers = exportColumns.map((col) => col.title).join(',');
    const rows = data.map((prodige) => {
        return exportColumns
            .map((col) => {
                let value = prodige[col.dataKey as keyof Prodige];
                if (col.dataKey === 'sport') value = getLabelFns.sportLabel(value as Sport);
                if (col.dataKey === 'gender') value = getLabelFns.genderLabel(value as Genre);
                if (col.dataKey === 'pays') value = getLabelFns.countryName(value as string);
                if (col.dataKey === 'tags') value = (value as Tag[])?.map(getLabelFns.tagLabel).join(';');
                return `"${value ?? ''}"`;
            })
            .join(',');
    });
    return [headers, ...rows].join('\n');
}
