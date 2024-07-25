import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SignupComponent {
  user = {
    username: '',
    email: '',
    password: '',
  };

  roles: { [key in 'user' | 'moderator' | 'admin']: boolean } = {
    user: false,
    moderator: false,
    admin: false,
  };

  constructor(private authService: AuthService, private router: Router) {}

  signup(): void {
    const selectedRoles = Object.keys(this.roles)
      .filter((key) => this.roles[key as 'user' | 'moderator' | 'admin'])
      .map((key) => key.toUpperCase());
    const signupData = { ...this.user, role: selectedRoles };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        this.router.navigate(['/signin']);
      },
      error: (error: any) => {
        console.error('Signup failed', error);
      },
    });
  }
}
