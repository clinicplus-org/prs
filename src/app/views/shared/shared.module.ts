import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LabelComponent } from './label/label.component';
import { UploadComponent } from './upload/upload.component';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileComponent } from './profile/profile.component';
import { ImportComponent } from './import/import.component';
import { ExportComponent } from './export/export.component';
import { PrintComponent } from './print/print.component';


@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    LabelComponent,
    UploadComponent,
    ProfileComponent,
    ImportComponent,
    ExportComponent,
    PrintComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,

    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    LabelComponent,
    UploadComponent,
    ProfileComponent,
    ImportComponent,
    ExportComponent,
    PrintComponent
  ]
})
export class SharedModule { }
