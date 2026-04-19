import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../../../core/shared';
import { AdminService } from '../../../../core/services/admin.service';
import { ImpersonationService } from '../../../../core/services/impersonation.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AdminUser } from '../../../../core/interfaces/admin.interface';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule, TagModule, ToastModule, ConfirmDialogModule, TranslatePipe],
    templateUrl: './admin-users.component.html',
    providers: [MessageService, ConfirmationService],
})
export class AdminUsersComponent implements OnInit, OnDestroy {
    private readonly adminService = inject(AdminService);
    private readonly impersonationService = inject(ImpersonationService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly translationService = inject(TranslationService);

    // Signals
    loading = signal<boolean>(false);
    impersonating = signal<boolean>(false);
    users = signal<AdminUser[]>([]);
    totalRecords = signal<number>(0);

    // Pagination
    currentPage = 1;
    pageSize = 20;
    first = 0;

    // Search
    searchTerm = '';
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.setupSearch();
        // Don't call loadUsers() here - the p-table with [lazy]="true"
        // will fire onLazyLoad on init which calls loadUsers()
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupSearch(): void {
        this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
            this.currentPage = 1;
            this.first = 0;
            this.loadUsers();
        });
    }

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    loadUsers(): void {
        // Prevent duplicate calls while loading
        if (this.loading()) {
            return;
        }

        this.loading.set(true);

        this.adminService.getAllUsers(this.currentPage, this.pageSize, this.searchTerm || undefined).subscribe({
            next: (response) => {
                this.users.set(response.items);
                this.totalRecords.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading users:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('admin.users.messages.loadError'),
                });
                this.loading.set(false);
            },
        });
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchTerm);
    }

    onPageChange(event: any): void {
        this.first = event.first;
        this.currentPage = event.first / event.rows + 1;
        this.loadUsers();
    }

    impersonateUser(user: AdminUser): void {
        this.confirmationService.confirm({
            message: this.t('admin.users.confirm.impersonate', { username: user.username }),
            header: this.t('admin.users.impersonate.title'),
            icon: 'pi pi-user',
            acceptButtonStyleClass: 'p-button-warning',
            accept: async () => {
                this.impersonating.set(true);
                try {
                    await this.impersonationService.startViewAs(user);
                    this.messageService.add({
                        severity: 'success',
                        summary: this.t('shared.common.success'),
                        detail: this.t('admin.users.messages.impersonationStarted', { username: user.username }),
                    });
                } catch (error: any) {
                    console.error('View as error:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.t('shared.common.error'),
                        detail: error.message || this.t('admin.users.messages.impersonationError'),
                    });
                } finally {
                    this.impersonating.set(false);
                }
            },
        });
    }

    getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'danger';
            case 'moderator':
                return 'warn';
            default:
                return 'info';
        }
    }

    formatDate(timestamp?: number): string {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString();
    }
}
