import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private URL = 'http://localhost:3000/image';

  constructor(private http: HttpClient) {}

  postFile(fileToUpload: File, userId: number): Observable<any> {
    const endpoint = `${this.URL}/singleFileUpload/${userId}`;
    const formData: FormData = new FormData();
    formData.append('image', fileToUpload, fileToUpload.name);
    return this.http.post(endpoint, formData, {});
  }

  deleteImage(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }
}
