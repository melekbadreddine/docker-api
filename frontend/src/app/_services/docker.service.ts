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

  getImages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/images`);
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

  deleteImage(imageName: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/images?imageName=${imageName}`, {
        responseType: 'text',
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        tap((response) => console.log('Delete image response:', response)),
        catchError((error) => {
          console.error('Error in deleteImage:', error);
          return throwError(() => error);
        })
      );
  }

  deleteContainer(id: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/containers?containerId=${id}`, {
        responseType: 'text',
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        tap((response) => console.log('Delete container response:', response)),
        catchError((error) => {
          console.error('Error in deleteContainer:', error);
          return throwError(() => error);
        })
      );
  }

  createContainer(
    imageName: string,
    hostPort: number,
    containerPort: number
  ): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/containers/create`,
        {},
        {
          params: {
            imageName: imageName,
            hostPort: hostPort.toString(),
            containerPort: containerPort.toString(),
          },
          responseType: 'json',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }
      )
      .pipe(
        tap((response) => console.log('Create container response:', response)),
        catchError((error) => {
          console.error('Error in createContainer:', error);
          return throwError(() => error);
        })
      );
  }

  pullImage(repository: string, tag: string): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/images/pull`,
        {},
        {
          params: { repository, tag },
          responseType: 'text',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }
      )
      .pipe(
        tap((response) => console.log('Pull image response:', response)),
        catchError((error) => {
          console.error('Error in pullImage:', error);
          return throwError(() => error);
        })
      );
  }
}
