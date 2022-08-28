import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.endpoint + '/labels';

export interface Label {
  id: string;
  label: string;
}
@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private labelSub = new Subject<{ labels: Label[] }>();
  private labelSelectedSub = new Subject<any>();
  constructor(
    private http: HttpClient
  ) { }

  getAll(userId: string | null) {
    const queryParams = `?labelOwner=${userId}`;
    this.http.get<{message: string, labels: any }>(BACKEND_URL + queryParams).pipe(
      map((labelData: { labels: { _id: any; label: any; }[]; }) => {
        return {
          labels: labelData.labels.map((resLabel: { _id: any; label: any; }) => {
            return {
              id: resLabel._id,
              label: resLabel.label
            };
          })
        };
      })
    )
    .subscribe((transformData: { labels: any; }) => {
      this.labelSub.next({
        labels: [...transformData.labels]
      });
    });
  }

  getLabels() {
    return this.labelSub.asObservable();
  }

  getSelectedLabel() {
    return this.labelSelectedSub.asObservable();
  }

  get(labelId: string) {
    return this.http.get<any>(BACKEND_URL + '/' + labelId);
  }

  insert(newLabel: any) {
    return this.http.post<{ message: string, label: any }>(BACKEND_URL, newLabel);
  }

  update(updatedLabel: any) {
    return this.http.put<{ message: string }>(BACKEND_URL + '/' + updatedLabel._id, updatedLabel);
  }

  delete(labelId: string) {
    return this.http.delete<{ message: string }>(BACKEND_URL + '/' + labelId);
  }

  setSelectedLabel(selectedId: string) {
    this.labelSelectedSub.next(selectedId);
  }
}
