import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockchainService } from 'src/app/shared/services/blockchain.service';
import { Blockchain } from 'src/app/shared/interfaces/blockchain';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { RecordsService } from 'src/app/shared/services/records.service';
import { Records } from '../../patients';

@Component({
  selector: 'app-patient-record-detail',
  templateUrl: './patient-record-detail.component.html',
  styleUrls: ['./patient-record-detail.component.scss']
})
export class PatientRecordDetailComponent implements OnInit, OnDestroy {
  recordId: string;
  record: Records;
  recordSub: Subscription;

  public dataSource: MatTableDataSource<any>;
  public displayedColumns: string[] = [
    'medicine',
    'preparation',
    'sig',
    'quantity'
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private recordsService: RecordsService,
    private blockchainService: BlockchainService
  ) { }

  ngOnInit() {
    // get block Id
    this.recordId = this.activatedRoute.snapshot.params.recordId;

    // get blockchain information
    this.recordSub = this.recordsService.get(this.recordId).subscribe((record) => {
      console.log(record);
      this.record = record;
      // this.dataSource = record.transactions.data.prescriptions.prescriptions;
    });
  }

  ngOnDestroy() {
    // unsubscribe
    this.recordSub.unsubscribe();
  }
}
