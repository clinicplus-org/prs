import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Setting {
  settingId: string;
  general: any;
  notification: any;
  subscription: string;
}

const BACKEND_URL = environment.endpoint + '/setting';
@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private settingsUpdated = new Subject<Setting>();

  constructor(
    private http: HttpClient
  ) { }


  get(userId: string) {
   return this.http.get<any>(BACKEND_URL + '/' + userId);
  }

  getSetting(userId: string | null) {
    this.http.get<Setting>(BACKEND_URL + '/' + userId)
    .subscribe((res: any) => {
      this.settingsUpdated.next(res);
    });
  }

  getSettingListener() {
    return this.settingsUpdated.asObservable();
  }

  setSetting(updatedSetting: any) {
    return this.http.put<{ message: string }>(BACKEND_URL + '/' + updatedSetting.userId, updatedSetting);
  }
}
