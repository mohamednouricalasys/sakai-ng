// src/app/features/professional/professional.routes.ts
import { Routes } from '@angular/router';
import { ProfessionalComponent } from './professional.component';
import { ProdigeCrudComponent } from './components/prodige-crud/prodige-crud.component';
import { ProdigeVideoCrudComponent } from './components/prodige-video-crud/prodige-video-crud.component';
import { AdminVideoModerationComponent } from './components/admin-video-moderation/admin-video-moderation.component';
import { VideoGalleryComponent } from './components/video-gallery/video-gallery.component';

export const PROFESSIONAL_ROUTES: Routes = [
    {
        path: '',
        component: ProfessionalComponent, // This component provides the layout with the sidebar
        children: [
            { path: '', redirectTo: 'gallery', pathMatch: 'full' },
            { path: 'prodiges', component: ProdigeCrudComponent },
            { path: 'videos', component: ProdigeVideoCrudComponent },
            { path: 'videos/:id', component: ProdigeVideoCrudComponent },
            { path: 'moderation', component: AdminVideoModerationComponent },
            { path: 'gallery', component: VideoGalleryComponent },
        ],
    },
];
