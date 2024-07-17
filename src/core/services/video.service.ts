import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FolderList } from '../models/video.model';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient) { }

  getFolders(): Observable<FolderList> {
    return this.http.get<FolderList>('assets/videos.json');
  }

  getSubtitles(videoName: string, captionsName: string): Observable<string> {
    return this.http.get(`assets/${videoName}/${captionsName}`, { responseType: 'text' });
  }
}