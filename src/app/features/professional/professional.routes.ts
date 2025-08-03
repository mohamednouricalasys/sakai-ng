// src/app/features/professional/professional.routes.ts
import { Routes } from '@angular/router';
import { ProfessionalComponent } from './professional.component';
import { MyAthletesComponent } from './components/my-athletes/my-athletes.component';
import { UploadVideoComponent } from './components/upload-video/upload-video.component';
import { MessagesComponent } from './components/messages/messages.component';
import { ProfessionalDashboardComponent } from './components/professional-dashboard/professional-dashboard.component';

export const PROFESSIONAL_ROUTES: Routes = [
    {
        path: '',
        component: ProfessionalComponent, // This component provides the layout with the sidebar
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default route for professional
            { path: 'dashboard', component: ProfessionalDashboardComponent },
            { path: 'my-athletes', component: MyAthletesComponent },
            { path: 'upload-video', component: UploadVideoComponent },
            { path: 'messages', component: MessagesComponent },
            { path: 'profile', component: ProfessionalDashboardComponent }, // Placeholder, create a real profile component
        ],
    },
];
