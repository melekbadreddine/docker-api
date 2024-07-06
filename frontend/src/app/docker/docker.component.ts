import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { DockerService } from '../_services/docker.service';

@Component({
  selector: 'app-docker',
  templateUrl: './docker.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class DockerComponent implements OnInit {
  containers: any[] = [];

  constructor(
    private dockerService: DockerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated, loading containers');
      this.loadContainers();
    } else {
      console.log('User is not authenticated, redirecting to signin');
      this.router.navigate(['/signin']);
    }
  }

  loadContainers() {
    this.dockerService.getContainers().subscribe({
      next: (data: any) => {
        console.log('Containers loaded successfully:', data);
        this.containers = data;
      },
      error: (error) => {
        console.error('Error loading containers', error);
        if (error.status === 401) {
          this.authService.logout();
        }
      },
    });
  }

  startContainer(id: string) {
    this.dockerService.startContainer(id).subscribe({
      next: () => {
        this.loadContainers();
      },
      error: (error) => {
        console.error('Error starting container', error);
      },
    });
  }

  stopContainer(id: string) {
    this.dockerService.stopContainer(id).subscribe({
      next: () => {
        this.loadContainers();
      },
      error: (error) => {
        console.error('Error stopping container', error);
      },
    });
  }
}
