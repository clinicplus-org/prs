import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(dialogMessage: any) {
    return this.dialog.open(DialogComponent, {
       width: '30%',
       panelClass: 'confirm-dialog-container',
       disableClose: true,
       data : {
         message : dialogMessage
       }
     });
   }
}
