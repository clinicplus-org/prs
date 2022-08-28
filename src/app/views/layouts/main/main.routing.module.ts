import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';


const routes: Routes = [{
  path: '',
  component: MainComponent,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadChildren: () => import('../../private/dashboard/dashboard.module').then(m => m.DashboardModule) },
    { path: 'user', loadChildren: () => import('../../private/user/user.module').then(m => m.UserModule) },
    { path: 'setting', loadChildren: () => import('../../private/setting/setting.module').then(m => m.SettingModule) },
    { path: 'notification', loadChildren: () => import('../../private/notification/notification.module').then(m => m.NotificationModule) }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
