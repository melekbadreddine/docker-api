import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

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
    console.log(`Starting container with ID: ${id}`);
    return this.http
      .post(
        `${this.baseUrl}/containers/start?containerId=${id}`,
        {},
        {
          responseType: 'text',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }
      )
      .pipe(
        tap((response) => console.log('Start container response:', response)),
        catchError((error) => {
          console.error('Error in startContainer:', error);
          return throwError(error);
        })
      );
  }

  stopContainer(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/containers/stop?containerId=${id}`,
      {},
      {
        responseType: 'text',
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }
}
