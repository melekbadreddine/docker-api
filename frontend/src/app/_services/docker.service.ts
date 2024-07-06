import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DockerService {
  private baseUrl = 'http://localhost:8080/api/docker';

  constructor(private http: HttpClient) {}

  getContainers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/containers`);
  }

  startContainer(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/containers/${id}/start`, {});
  }

  stopContainer(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/containers/${id}/stop`, {});
  }
}
