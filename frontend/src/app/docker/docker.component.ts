import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-docker',
  templateUrl: './docker.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class DockerComponent implements OnInit {
  containers: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadContainers();
  }

  loadContainers() {
    this.http.get('http://localhost:8080/api/docker/containers').subscribe({
      next: (data: any) => {
        console.log('Containers loaded successfully:', data);
        this.containers = data;
      },
      error: (error) => {
        console.error('Error loading containers', error);
        if (error.error instanceof ErrorEvent) {
          console.error('Client-side error:', error.error.message);
        } else {
          console.error(`Server-side error: ${error.status} ${error.error}`);
        }
      },
    });
  }

  startContainer(id: string) {
    this.http
      .post(`http://localhost:8080/api/docker/containers/${id}/start`, {})
      .subscribe({
        next: () => {
          this.loadContainers();
        },
        error: (error) => {
          console.error('Error starting container', error);
        },
      });
  }

  stopContainer(id: string) {
    this.http
      .post(`http://localhost:8080/api/docker/containers/${id}/stop`, {})
      .subscribe({
        next: () => {
          this.loadContainers();
        },
        error: (error) => {
          console.error('Error stopping container', error);
        },
      });
  }
}
