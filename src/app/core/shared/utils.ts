import { SelectItem } from 'primeng/api';
import { Sport } from '../enums/sport.enum';
import { Tag } from '../enums/tag.enum';
import { Gender } from '../enums/gender.enum';
import { Country } from '../interfaces/country.interface';
import { TranslationService } from '../services/translation.service';

// ============================================
// INTERFACES & TYPES
// ============================================

export interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

export interface ExportColumn {
    title: string;
    dataKey: string;
}

export interface CrudEntity {
    id?: string;
    dateCreation?: Date;
    creePar?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export type LayoutType = 'list' | 'grid';
export type SeverityType = 'info' | 'success' | 'warn' | 'danger';

// ============================================
// ID GENERATION UTILITY
// ============================================

export class IdGenerator {
    /**
     * Generates a random alphanumeric ID
     * @param length - Length of the generated ID (default: 8)
     * @returns Generated ID string
     */
    static generateId(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    /**
     * Generates a UUID-like ID
     * @returns UUID-like string
     */
    static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

// ============================================
// ARRAY UTILITIES
// ============================================

export class ArrayUtils {
    /**
     * Finds the index of an entity by its ID
     * @param entities - Array of entities
     * @param id - ID to search for
     * @returns Index of the entity or -1 if not found
     */
    static findIndexById<T extends CrudEntity>(entities: T[], id: string): number {
        return entities.findIndex((entity) => entity.id === id);
    }

    /**
     * Removes an entity from array by ID
     * @param entities - Array of entities
     * @param id - ID of entity to remove
     * @returns New array without the specified entity
     */
    static removeById<T extends CrudEntity>(entities: T[], id: string): T[] {
        return entities.filter((entity) => entity.id !== id);
    }

    /**
     * Updates an entity in array by ID
     * @param entities - Array of entities
     * @param updatedEntity - Updated entity
     * @returns New array with updated entity
     */
    static updateById<T extends CrudEntity>(entities: T[], updatedEntity: T): T[] {
        const index = this.findIndexById(entities, updatedEntity.id!);
        if (index === -1) return entities;

        const newEntities = [...entities];
        newEntities[index] = updatedEntity;
        return newEntities;
    }

    /**
     * Adds a new entity to array
     * @param entities - Array of entities
     * @param newEntity - New entity to add
     * @returns New array with added entity
     */
    static addEntity<T extends CrudEntity>(entities: T[], newEntity: T): T[] {
        return [...entities, newEntity];
    }
}

// ============================================
// SEVERITY UTILITIES
// ============================================

export class SeverityUtils {
    /**
     * Gets severity based on age ranges
     * @param age - Age value
     * @returns Severity string
     */
    static getAgeSeverity(age: number): SeverityType {
        if (age <= 12) return 'info';
        if (age <= 15) return 'success';
        if (age <= 17) return 'warn';
        return 'danger';
    }

    /**
     * Gets severity based on count values
     * @param count - Count value
     * @param thresholds - Custom thresholds object
     * @returns Severity string
     */
    static getCountSeverity(count: number, thresholds: { danger: number; warn: number } = { danger: 0, warn: 2 }): SeverityType {
        if (count === thresholds.danger) return 'danger';
        if (count <= thresholds.warn) return 'warn';
        return 'success';
    }

    /**
     * Gets severity based on percentage
     * @param percentage - Percentage value (0-100)
     * @returns Severity string
     */
    static getPercentageSeverity(percentage: number): SeverityType {
        if (percentage < 25) return 'danger';
        if (percentage < 50) return 'warn';
        if (percentage < 75) return 'info';
        return 'success';
    }
}

// ============================================
// SORTING UTILITIES
// ============================================

export class SortUtils {
    /**
     * Creates standard sort options for a field
     * @param translationService - Translation service instance
     * @param fieldKey - Translation key for the field
     * @param fieldValue - Field value for sorting
     * @returns Array of sort options
     */
    static createSortOptions(translationService: TranslationService, fieldKey: string, fieldValue: string): SelectItem[] {
        return [
            {
                label: translationService.translate(`${fieldKey}.down`),
                value: `!${fieldValue}`,
            },
            {
                label: translationService.translate(`${fieldKey}.up`),
                value: fieldValue,
            },
        ];
    }

    /**
     * Parses sort value to get order and field
     * @param sortValue - Sort value string
     * @returns Object with sortOrder and sortField
     */
    static parseSortValue(sortValue: string): { sortOrder: number; sortField: string } {
        if (sortValue.indexOf('!') === 0) {
            return {
                sortOrder: -1,
                sortField: sortValue.substring(1),
            };
        } else {
            return {
                sortOrder: 1,
                sortField: sortValue,
            };
        }
    }
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export class ValidationUtils {
    /**
     * Validates required string field
     * @param value - Value to validate
     * @param fieldName - Field name for error message
     * @returns Validation result
     */
    static validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
        if (!value || !value.trim()) {
            return {
                isValid: false,
                errorMessage: `${fieldName} is required`,
            };
        }
        return { isValid: true };
    }

    /**
     * Validates array length constraints
     * @param array - Array to validate
     * @param min - Minimum length
     * @param max - Maximum length
     * @param fieldName - Field name for error message
     * @returns Validation result
     */
    static validateArrayLength<T>(array: T[] | undefined | null, min: number, max: number, fieldName: string): ValidationResult {
        const length = array?.length || 0;

        if (length < min) {
            return {
                isValid: false,
                errorMessage: `${fieldName} must have at least ${min} items`,
            };
        }

        if (length > max) {
            return {
                isValid: false,
                errorMessage: `${fieldName} cannot have more than ${max} items`,
            };
        }

        return { isValid: true };
    }

    /**
     * Validates number range
     * @param value - Number to validate
     * @param min - Minimum value
     * @param max - Maximum value
     * @param fieldName - Field name for error message
     * @returns Validation result
     */
    static validateNumberRange(value: number | undefined | null, min: number, max: number, fieldName: string): ValidationResult {
        if (value === undefined || value === null) {
            return {
                isValid: false,
                errorMessage: `${fieldName} is required`,
            };
        }

        if (value < min || value > max) {
            return {
                isValid: false,
                errorMessage: `${fieldName} must be between ${min} and ${max}`,
            };
        }

        return { isValid: true };
    }

    /**
     * Validates email format
     * @param email - Email to validate
     * @returns Validation result
     */
    static validateEmail(email: string): ValidationResult {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                isValid: false,
                errorMessage: 'Invalid email format',
            };
        }
        return { isValid: true };
    }
}

// ============================================
// CSV EXPORT UTILITIES
// ============================================

export class CsvExportUtils {
    /**
     * Exports data to CSV file
     * @param data - Data to export
     * @param columns - Column definitions
     * @param filename - Output filename
     * @param formatters - Optional field formatters
     */
    static exportToCsv<T>(data: T[], columns: ExportColumn[], filename: string = 'export.csv', formatters?: Record<string, (value: any) => string>): void {
        if (!data || data.length === 0) {
            throw new Error('No data to export');
        }

        const headers = columns.map((col) => col.title).join(',');
        const rows = data.map((item) => {
            return columns
                .map((col) => {
                    let value = (item as any)[col.dataKey];

                    // Apply formatter if available
                    if (formatters && formatters[col.dataKey]) {
                        value = formatters[col.dataKey](value);
                    }

                    // Handle undefined/null values and escape quotes
                    const stringValue = value !== undefined && value !== null ? String(value).replace(/"/g, '""') : '';
                    return `"${stringValue}"`;
                })
                .join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        this.downloadCsv(csvContent, filename);
    }

    /**
     * Downloads CSV content as file
     * @param csvContent - CSV content string
     * @param filename - Filename
     */
    private static downloadCsv(csvContent: string, filename: string): void {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            throw new Error('CSV export not supported in this browser');
        }
    }

    /**
     * Creates standard formatters for common field types
     * @param translationService - Translation service for labels
     * @returns Object with formatter functions
     */
    static createStandardFormatters(translationService?: TranslationService): Record<string, (value: any) => string> {
        return {
            date: (value: Date) => value?.toLocaleDateString('en-GB') || '',
            dateTime: (value: Date) => value?.toLocaleString('en-GB') || '',
            boolean: (value: boolean) => (value ? 'Yes' : 'No'),
            array: (value: any[]) => value?.join('; ') || '',
            sport: (value: Sport) => (translationService ? translationService.translate(`sports.${value}`) : String(value)),
            gender: (value: Gender) => (translationService ? translationService.translate(`shared.common.${value === Gender.Homme ? 'male' : 'female'}`) : String(value)),
            tags: (value: Tag[]) => value?.map((tag) => (translationService ? translationService.translate(`tags.${tag}`) : String(tag))).join('; ') || '',
        };
    }
}

// ============================================
// FORM UTILITIES
// ============================================

export class FormUtils {
    /**
     * Resets form entity to initial state
     * @param initialValues - Initial values object
     * @returns Reset entity
     */
    static resetEntity<T extends CrudEntity>(initialValues: Partial<T>): T {
        return {
            ...initialValues,
            id: undefined,
            dateCreation: undefined,
            creePar: undefined,
        } as T;
    }

    /**
     * Prepares entity for creation
     * @param entity - Entity to prepare
     * @param currentUser - Current user identifier
     * @returns Entity ready for creation
     */
    static prepareForCreation<T extends CrudEntity>(entity: T, currentUser: string): T {
        return {
            ...entity,
            id: IdGenerator.generateId(),
            dateCreation: new Date(),
            creePar: currentUser,
        };
    }

    /**
     * Creates gender options for forms
     * @param translationService - Translation service
     * @returns Array of gender options
     */
    static createGenderOptions(translationService: TranslationService): SelectItem[] {
        return [
            {
                label: translationService.translate('shared.common.male'),
                value: Gender.Homme,
            },
            {
                label: translationService.translate('shared.common.female'),
                value: Gender.Femme,
            },
        ];
    }

    /**
     * Creates layout options for data views
     * @returns Array of layout options
     */
    static createLayoutOptions(): LayoutType[] {
        return ['list', 'grid'];
    }
}

// ============================================
// FILTER UTILITIES
// ============================================

export class FilterUtils {
    /**
     * Filters array by search term across multiple fields
     * @param items - Items to filter
     * @param searchTerm - Search term
     * @param searchFields - Fields to search in
     * @returns Filtered items
     */
    static globalFilter<T>(items: T[], searchTerm: string, searchFields: (keyof T)[]): T[] {
        if (!searchTerm.trim()) return items;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return items.filter((item) =>
            searchFields.some((field) => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(lowerSearchTerm);
            }),
        );
    }

    /**
     * Gets available options by excluding already selected items
     * @param allOptions - All available options
     * @param selectedItems - Already selected items
     * @param valueKey - Key to compare values
     * @returns Available options
     */
    static getAvailableOptions<T, K>(allOptions: T[], selectedItems: K[] | undefined, valueKey: keyof T): T[] {
        if (!selectedItems || selectedItems.length === 0) return allOptions;
        return allOptions.filter((option) => !selectedItems.includes(option[valueKey] as unknown as K));
    }
}

// ============================================
// COUNTRY UTILITIES
// ============================================

export class CountryUtils {
    /**
     * Translates country names using translation service
     * @param countries - Array of countries
     * @param translationService - Translation service
     * @returns Countries with translated names
     */
    static translateCountries(countries: Country[], translationService: TranslationService): Country[] {
        return countries.map((country) => ({
            ...country,
            name: translationService.translate(`countries.${country.code.toLowerCase()}`),
        }));
    }

    /**
     * Finds country by code
     * @param countries - Array of countries
     * @param code - Country code
     * @returns Found country or undefined
     */
    static findCountryByCode(countries: Country[], code: string): Country | undefined {
        return countries.find((c) => c.code === code);
    }

    /**
     * Gets country name by code
     * @param code - Country code
     * @returns Formatted country name
     */
    static getCountryName(code: string): string {
        return code?.toUpperCase() || '';
    }
}

// ============================================
// TRANSLATION HELPERS
// ============================================

export class TranslationHelpers {
    /**
     * Creates a translation function bound to a service
     * @param translationService - Translation service instance
     * @returns Translation function
     */
    static createTranslator(translationService: TranslationService) {
        return (key: string, params?: Record<string, any>): string => {
            return translationService.translate(key, params);
        };
    }

    /**
     * Creates a count translation function bound to a service
     * @param translationService - Translation service instance
     * @returns Count translation function
     */
    static createCountTranslator(translationService: TranslationService) {
        return (key: string, count: number): string => {
            return translationService.translateWithCount(key, count);
        };
    }
}

// ============================================
// CRUD BASE CLASS
// ============================================

export abstract class BaseCrudComponent<T extends CrudEntity> {
    // Common properties
    dialog: boolean = false;
    entity!: T;
    entities: T[] = [];
    selectedEntities: T[] | null = null;
    submitted: boolean = false;
    layout: LayoutType = 'list';

    // Abstract methods to be implemented by derived classes
    abstract loadData(): void;
    abstract createNewEntity(): T;
    abstract validateEntity(entity: T): ValidationResult;
    abstract getEntityDisplayName(entity: T): string;

    // Common methods
    openNew(): void {
        this.entity = this.createNewEntity();
        this.submitted = false;
        this.dialog = true;
    }

    editEntity(entity: T): void {
        this.entity = { ...entity };
        this.dialog = true;
    }

    hideDialog(): void {
        this.dialog = false;
        this.submitted = false;
    }

    deleteEntity(entity: T): void {
        this.entities = ArrayUtils.removeById(this.entities, entity.id!);
    }

    findIndexById(id: string): number {
        return ArrayUtils.findIndexById(this.entities, id);
    }

    saveEntity(): boolean {
        this.submitted = true;
        const validation = this.validateEntity(this.entity);

        if (!validation.isValid) {
            return false;
        }

        if (this.entity.id) {
            // Update
            this.entities = ArrayUtils.updateById(this.entities, this.entity);
        } else {
            // Create
            this.entity = FormUtils.prepareForCreation(this.entity, 'current-user');
            this.entities = ArrayUtils.addEntity(this.entities, this.entity);
        }

        this.hideDialog();
        return true;
    }
}
