import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, merge, of as observableOf } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { AuthComponent } from 'src/app/auth/auth.component';
import { AuthService } from 'src/app/auth/auth.service';
// import { DialogService } from 'src/app/views/base/dialog/dialog.service';
import { NotificationService } from 'src/app/views/base/notification/notification.service';
import { ExportComponent } from 'src/app/views/shared/export/export.component';
import { LabelComponent } from 'src/app/views/shared/label/label.component';
import { LabelService } from 'src/app/views/shared/label/label.service';
import { PrintComponent } from 'src/app/views/shared/print/print.component';
import { QrcodeReaderComponent } from 'src/app/views/shared/qrcode-reader/qrcode-reader.component';
import { QrcodeWriterComponent } from 'src/app/views/shared/qrcode-writer/qrcode-writer.component';
import { UploadService } from 'src/app/views/shared/upload/upload.service';
import { Setting, SettingService } from '../../../setting/setting.service';
import { PatientService } from '../patient.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class PatientListComponent implements OnInit, AfterViewInit, OnDestroy {
  public length: number;
  public perPage: number;
  public currentPage: number;
  public pageSizeOptions: any;
  public isLoading: boolean;
  public userId: string | null;
  public avatar!: string;
  public patients: any;

  private ids: any = [];

  option!: string;
  labelSelected: any[];
  labelPicked: string;
  labels!: any[];
  labelsSub!: Subscription;
  setting!: Setting;
  settingsData: any;

  public dataSource!: MatTableDataSource<any>;
  public columnsToDisplay: string[] = [
    'select',
    'firstname',
    'middlename',
    'lastname',
    'contact',
    'gender',
    'birthdate',
    'age',
    'action'
  ];
  public selection = new SelectionModel<any>(true, []);
  public expandedElement: any;
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false })
  sort!: MatSort;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    // private dialogService: DialogService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private uploadService: UploadService,
    private settingService: SettingService,
    private authService: AuthService,
    private labelService: LabelService,
    private dialog: MatDialog
  ) {
    this.length = 0;
    this.perPage = 10;
    this.currentPage = 1;
    this.pageSizeOptions = [10, 20, 40, 80, 150, 300];
    this.isLoading = true;
    this.labelSelected = [];
    this.labelPicked = '';
    this.userId = this.authService.getUserId();
  }

  ngOnInit() {
    this.settingService.getSetting(this.userId);
    this.settingService.getSettingListener()
    .subscribe((setting) => {
      // this.translate.use((setting) ? setting.language : this.appConfigurationService.language);
    });

    this.option = this.activatedRoute.snapshot.url[0].path;

    this.titleService.setTitle('My Patients');
    this.getQuery(this.perPage, this.currentPage, this.labelPicked);

    this.labelService.getAll(this.userId);
    this.labelsSub = this.labelService.getLabels()
      .subscribe((res) => {
      this.labels = res.labels;
    });

    this.labelService.getSelectedLabel().subscribe((label) => {
      this.labelPicked = label;
      this.filterLabel(label);
    });

    this.onReset();
  }

  getLogo(settingId: string) {
    this.uploadService.get(settingId).subscribe((setting) => {
      console.log(setting);
    });
  }

  filterLabel(labelId: any) {
    this.getQuery(this.perPage, this.currentPage, labelId);
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          return this.patientService.getUpdateListener();
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoading = false;
          this.length = data.counts;
          return data.patients;
        }),
        catchError(() => {
          this.isLoading = false;
          return observableOf([]);
        })
      ).subscribe(
        data => {
          this.dataSource = new MatTableDataSource(this.setOwnerShip(data));
        }
      );

      this.paginator._intl.itemsPerPageLabel = 'Items per page:';
      this.paginator._intl.nextPageLabel = 'Next page';
      this.paginator._intl.previousPageLabel = 'Pervious page';
      // this.paginator._intl.getRangeLabel = matRangeLabelIntl;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.selection.selected.length === this.length;
  }

  isCheckboxChange(row: any) {
      this.selection.toggle(row);
      this.selectListener();
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
    this.selection.clear() :
    this.dataSource.data.forEach(
      row => {
        this.selection.select(row);
        this.selectListener();
      }
    );
  }

  onToggleSelect(option: string) {
    if (option === 'all') {
      this.dataSource.data.forEach(
        row => {
          this.selection.select(row);
          this.selectListener();
        }
      );
    } else {
      this.selection.clear();
      this.selectListener();
    }
  }

  selectListener() {
    this.patientService.setSelectedItem(this.selection.selected);
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  applyFilter(filterValue: KeyboardEvent) {
    const filterKey = (filterValue.target as HTMLInputElement).value;
    this.dataSource.filter =  filterKey.toLowerCase()
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  setOwnerShip(data: any[]) {
    const newUsers: any[] = [];
    data.forEach(user => {
      const ownerShip = {
        isOwned : user.physicians.some((e: { userId: string | null; }) => e.userId === this.userId)
      };
      newUsers.push({...user, ...ownerShip});
    });
    return newUsers;
  }

  getQuery(perPage: number, currentPage: number, label: string) {
    if (this.option === 'list') {
      this.patientService.getMyPatient(this.userId, perPage, currentPage, label);
    } else {
      this.patientService.getAll(perPage, currentPage, label);
    }
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.perPage = pageData.pageSize;
    this.length = pageData.length;
    this.getQuery(this.perPage, this.currentPage, this.labelPicked);
  }

  onUpdate(patientId: string) {
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // dialogConfig.width = '50%';
    // // set modal title
    // dialogConfig.data = {
    //   id: patientId,
    //   title: 'Update patients',
    //   button: 'Update'
    // };

    // this.dialog.open(PatientFormComponent, dialogConfig).afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.notificationService.success('Patient updated successfully.');
    //     this.getQuery(this.perPage, this.currentPage, this.labelPicked);
    //   }
    // });
  }

  onScan() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    // set modal title
    dialogConfig.data = {
      title: 'Scan QR Code'
    };

    this.dialog.open(QrcodeReaderComponent, dialogConfig);
  }

  onGenerateQr(patientId: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    // set modal title
      dialogConfig.data = {
        id: patientId,
        title: 'QR Code'
      };

    this.dialog.open(QrcodeWriterComponent, dialogConfig);
  }

  onDetail(user: any) {
    if (!user.isOwned) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      // set modal title
      dialogConfig.data = {
        title: 'Scan QR code to confirm visit'
      };

      this.dialog.open(QrcodeReaderComponent, dialogConfig);
    } else {
      this.router.navigate(['../', user.id], {relativeTo: this.activatedRoute});
    }
  }

  onReset() {
    this.onToggleSelect('none');
    this.labelPicked = '';
    this.getQuery(this.perPage, this.currentPage, '');
  }

  onExport() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.data = {
      title: 'Export patients',
      selectedItem: this.selection.selected
    };

    this.dialog.open(ExportComponent, dialogConfig);
  }

  onPrint() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.data = {
      title: 'Print patients',
      selectedItem: this.selection.selected
    };

    this.dialog.open(PrintComponent, dialogConfig);
  }

  filterSelection() {
    return this.selection.selected.filter((select) => {
      return select.isOwned === true;
    });
  }

  onDelete() {
    // check for allowed record lenght
    if (this.filterSelection().length) {
        // this.dialogService.openConfirmDialog(`Are you sure to delete ${this.filterSelection().length} record ?`)
        // .afterClosed().subscribe(dialogRes => {
        //   if (dialogRes) {

        //     this.filterSelection().forEach(element => {
        //       this.ids.push(element.id);
        //     });
        //     this.patientService.deleteMany(this.ids).subscribe((res) => {
        //       this.notificationService.success('Patient deleted successfully.');
        //       this.getQuery(this.perPage, this.currentPage, this.labelPicked);
        //     });
        //   }
        // });
    } else {
      this.notificationService.warn('You are not permitted to take this action!');
    }
  }

  onRowClicked(row: any) {
    console.log('Row clicked: ', row);
  }

  onCreateLabel(labelId?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Create label',
      btn: 'Submit',
      id: labelId
    };

    this.dialog.open(LabelComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.success('Label created successfully.');
        this.labelService.getAll(this.userId);
      }
    });
  }

  onSelectLabel(e: any, labelId: string) {
    e.stopPropagation();
    if (!this.checkLabel(labelId)) {
      this.labelSelected.push(labelId);
    } else {
      this.labelSelected = this.labelSelected.filter(value => {
         return value !== labelId;
      });
    }
  }

  onApplySelectedLabel() {
    this.filterSelection().forEach(element => {
      this.patientService.setLabel(element.id, this.labelSelected).subscribe((response) => {
        this.getQuery(this.perPage, this.currentPage, this.labelPicked);
        this.notificationService.success('Label updated successfully');
        this.labelSelected = [];
        this.selection.clear();
      });
    });
  }

  checkLabel(labelId: string) {
    return this.labelSelected.find(x => x === labelId);
  }

  onCreateAuth(patientId: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.data = {
      title: 'Generate Auth',
      id: patientId
    };

    this.dialog.open(AuthComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.success('Patient updated successfully.');
      }
    });
  }

  ngOnDestroy() {
    this.labelsSub.unsubscribe();
  }

}
