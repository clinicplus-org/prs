import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.endpoint + '/upload';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private profilePictureSub = new Subject<any>();

  constructor(private http: HttpClient) {}

  upload(sourceId: string, image: string | ArrayBuffer) {
    const uploadData = {
      origId: sourceId,
      origImage: image
    };
    return this.http.post<{ message: string, imagePath: string }>(BACKEND_URL, uploadData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  get(sourceId: string | null) {
    return this.http.get<{image: any}>(
      BACKEND_URL + '/' + sourceId
    );
  }

  setProfilePic(image: any) {
    this.profilePictureSub.next(image);
  }

  getProfilePicture() {
    return this.profilePictureSub.asObservable();
  }
}
