import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, PaginatedAdminUsers, ImpersonationResult } from '../interfaces/admin.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/admin`;

    getAllUsers(page: number = 1, pageSize: number = 20, search?: string): Observable<PaginatedAdminUsers> {
        let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<PaginatedAdminUsers>(this.apiUrl, { params });
    }

    impersonateUser(userId: string): Observable<ImpersonationResult> {
        return this.http.post<ImpersonationResult>(`${this.apiUrl}/${userId}/impersonate`, {});
    }
}
