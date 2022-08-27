import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuestComponent } from './guest.component';


const routes: Routes = [{
  path: '',
  component: GuestComponent,
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: () => import('../../public/home/home.module').then(m => m.HomeModule) },
    { path: 'faq', loadChildren: () => import('../../public/faq/faq.module').then(m => m.FaqModule) },
    { path: 'about', loadChildren: () => import('../../public/about/about.module').then(m => m.AboutModule) },
    { path: 'contact', loadChildren: () => import('../../public/contact/contact.module').then(m => m.ContactModule) }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuestRoutingModule { }
