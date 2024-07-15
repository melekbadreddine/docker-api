import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://192.168.49.2:30399/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  signin(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signin`, credentials).pipe(
      tap((response: any) => {
        if (response && response.accessToken) {
          this.setToken(response.accessToken);
          console.log('Token set successfully:', response.accessToken);
        }
      }),
      catchError((error) => {
        console.error('Error during sign in', error);
        return of(null);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    console.log('Token stored in localStorage:', token);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', token);
    return token;
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, user);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/signin']);
  }
}

