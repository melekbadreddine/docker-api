import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  signin(credentials: any) {
    return this.http.post(`${this.baseUrl}/signin`, credentials);
  }

  signup(user: any) {
    return this.http.post(`${this.baseUrl}/signup`, user);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/signin']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
