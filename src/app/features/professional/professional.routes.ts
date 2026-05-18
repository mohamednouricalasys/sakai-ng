// src/app/features/professional/professional.routes.ts
import { Routes } from '@angular/router';
import { ProfessionalComponent } from './professional.component';
import { ProdigeCrudComponent } from './components/prodige-crud/prodige-crud.component';
import { ProdigeVideoCrudComponent } from './components/prodige-video-crud/prodige-video-crud.component';
import { AdminVideoModerationComponent } from './components/admin-video-moderation/admin-video-moderation.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { VideoGalleryComponent } from './components/video-gallery/video-gallery.component';
import { AuthGuard } from '../../../guards/auth.guard';

export const PROFESSIONAL_ROUTES: Routes = [
    {
        path: '',
        component: ProfessionalComponent,
        children: [
            { path: '', redirectTo: 'gallery', pathMatch: 'full' },
            { path: 'gallery', component: VideoGalleryComponent },
            { path: 'prodiges', component: ProdigeCrudComponent, canActivate: [AuthGuard] },
            { path: 'videos', component: ProdigeVideoCrudComponent, canActivate: [AuthGuard] },
            { path: 'videos/:id', component: ProdigeVideoCrudComponent, canActivate: [AuthGuard] },
            { path: 'moderation', component: AdminVideoModerationComponent, canActivate: [AuthGuard] },
            { path: 'admin-users', component: AdminUsersComponent, canActivate: [AuthGuard] },
        ],
    },
];
