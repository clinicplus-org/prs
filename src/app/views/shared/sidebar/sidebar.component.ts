import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { NotificationService } from '../../base/notification/notification.service';
import { SettingService } from '../../private/setting/setting.service';
// import { PatientsService } from '../../private/user/patients/patients.service';
// import { PhysiciansService } from '../../private/user/physicians/physicians.service';
import { UserService } from '../../private/user/user.service';
import { ExportComponent } from '../export/export.component';
import { ImportComponent } from '../import/import.component';
import { LabelComponent } from '../label/label.component';
import { LabelService } from '../label/label.service';
import { PrintComponent } from '../print/print.component';
import { ProfileComponent } from '../profile/profile.component';
import { UploadService } from '../upload/upload.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  public perPage: number;
  public currentPage: number;
  public imagePath: any;
  defaultImage: any;
  imagePreview: any;
  fullname!: string;
  email!: string | null;
  userData: any;
  user: any;
  showLabel!: boolean;
  labels!: any[];
  labelsSub!: Subscription;
  userSub!: Subscription;

  isLoading: boolean;
  userId: string | null;
  setting: any;

  public selection = new SelectionModel<any>(true, []);
  selectedItem!: any[];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private settingService: SettingService,
    private authService: AuthService,
    // private physiciansService: PhysiciansService,
    private userService: UserService,
    private uploadService: UploadService,
    private labelService: LabelService,
    // private patientsService: PatientsService,
    private notificationService: NotificationService
  ) {
    this.perPage = 10;
    this.currentPage = 1;
    this.defaultImage = './../../../../assets/images/blank.png';
    this.isLoading = true;
    this.userId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.settingService.getSetting(this.userId);
    this.settingService.getSettingListener()
    .subscribe((setting) => {
      this.setting = setting;
    });

    this.labelService.getAll(this.userId);
    this.labelsSub = this.labelService.getLabels()
      .subscribe((res: { labels: any[]; }) => {
      this.labels = res.labels;
    });

    this.uploadService.getProfilePicture().subscribe((image: any) => {
      this.imagePreview = image;
    });

    this.email = this.authService.getUserEmail();

    this.getData(this.userId).subscribe((resData: any[]) => {
      this.isLoading = false;
      const merge = {...resData[0], ...resData[1], ...resData[2]};
      this.fullname = merge.name.firstname + ' ' + merge.name.lastname;
      this.imagePreview = merge.image;
    });

    this.userSub = this.userService.getSubListener().subscribe((userListener: { name: { firstname: string; midlename: string; lastname: string; }; }) => {
      this.fullname = userListener.name.firstname + ' ' + userListener.name.midlename + ' ' + userListener.name.lastname;
    });

    // this.patientsService.getSelectedItem().subscribe((res: any[]) => {
    //   this.selectedItem = res;
    //   console.log(res);
    // });
  }

  getData(userId: string | null): Observable<any> {
    const images = this.uploadService.get(userId);
    const users = this.userService.get(userId);
    // const physicians = this.physiciansService.get(userId);
    return forkJoin([images, users]);
  }

  onOpenProfile() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '40%';
    dialogConfig.data = {
      title: 'Profile',
      id: this.userId
    };

    this.dialog.open(ProfileComponent, dialogConfig);
  }

  onToogleLabel() {
    this.showLabel = !this.showLabel;
  }

  onCreateLabel(labelId?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: (labelId) ? 'Update' : 'Create',
      btn: (labelId) ? 'Update' : 'Submit',
      id: labelId
    };
    this.dialog.open(LabelComponent, dialogConfig).afterClosed().subscribe((result: string) => {
      if (result) {
        this.notificationService.success((result === 'update') ? 'Label updated!' : 'Label created!');
        this.labelService.getAll(this.userId);
      }
    });
  }

  onDeleteLabel(labelId: string) {
    this.labelService.delete(labelId).subscribe(() => {
        this.notificationService.success('Label successfully deleted!');
        this.labelService.getAll(this.userId);
    });
  }

  onCreatePatient() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '50%';
    dialogConfig.data = {
      id: null,
      title: 'Create new Patient',
      button: 'Submit'
    };
    // this.dialog.open(PatientFormComponent, dialogConfig);

    // this.dialog.open(PatientFormComponent, dialogConfig).afterClosed().subscribe((result: string) => {
    //   if (result) {
    //     this.notificationService.success('Patient successfully created!');
    //     this.router.navigateByUrl('/secure/users/patients/' + result + '/form');
    //   }
    // });
  }

  onImportOpen() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.data = {
      title: 'Import Patients.'
    };

    this.dialog.open(ImportComponent, dialogConfig);
  }

  onExportOpen() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.data = {
      title: 'Export Patients',
      selectedItem: this.selectedItem
    };

    this.dialog.open(ExportComponent, dialogConfig);
  }

  onPrintOpen() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.data = {
      title: 'Print Patients',
      selectedItem: this.selectedItem
    };

    this.dialog.open(PrintComponent, dialogConfig);
  }

  onFilterLabel(labelId: string) {
    this.labelService.setSelectedLabel(labelId);
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.labelsSub.unsubscribe();
  }
}
