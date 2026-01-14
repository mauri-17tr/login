import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  
  usuario: any = null;
  token: string = '';

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('usuario');
    const tok = localStorage.getItem('token');
    if (user) this.usuario = JSON.parse(user);
    if (tok) this.token = tok;
  }

  registrar(nombres: string, apellidos: string, correo: string, contrasena: string) {
    return this.http.post(`${this.apiUrl}/usuarios/registrar`, {
      nombres, apellidos, correo, contrasena
    });
  }

  login(correo: string, contrasena: string) {
    return this.http.post<any>(`${this.apiUrl}/usuarios/login`, {
      correo, contrasena
    });
  }

  logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.usuario = null;
    this.token = '';
  }
}