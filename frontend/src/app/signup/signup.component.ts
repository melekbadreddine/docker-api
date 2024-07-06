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

  constructor(private authService: AuthService, private router: Router) {}

  signup(): void {
    this.authService.signup(this.user).subscribe({
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
