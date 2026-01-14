import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  
})
export class LoginComponent {
  mostrarLogin = true;
  
  correoLogin = '';
  contrasenaLogin = '';
  errorLogin = '';
  
  nombres = '';
  apellidos = '';
  correoRegistro = '';
  contrasenaRegistro = '';
  confirmarContrasena = '';
  errorRegistro = '';
  
  usuarioActual: any = null;

  constructor(public auth: AuthService) {
    this.usuarioActual = auth.usuario;
  }

  registrar() {
    if (!this.nombres || !this.apellidos || !this.correoRegistro || !this.contrasenaRegistro) {
      this.errorRegistro = 'Completa todos los campos';
      return;
    }
    
    if (this.contrasenaRegistro !== this.confirmarContrasena) {
      this.errorRegistro = 'Las contraseñas no coinciden';
      return;
    }

    this.auth.registrar(this.nombres, this.apellidos, this.correoRegistro, this.contrasenaRegistro)
      .subscribe({
        next: () => {
          alert('Registrado correctamente. Inicia sesión');
          this.mostrarLogin = true;
          this.nombres = '';
          this.apellidos = '';
          this.correoRegistro = '';
          this.contrasenaRegistro = '';
          this.confirmarContrasena = '';
          this.errorRegistro = '';
        },
        error: (e) => {
          this.errorRegistro = e.error.mensaje || 'Error al registrar';
        }
      });
  }

  login() {
    if (!this.correoLogin || !this.contrasenaLogin) {
      this.errorLogin = 'Completa email y contraseña';
      return;
    }

    this.auth.login(this.correoLogin, this.contrasenaLogin)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.auth.usuario = res.usuario;
          this.auth.token = res.token;
          this.usuarioActual = res.usuario;
          this.mostrarLogin = false;
        },
        error: (e) => {
          this.errorLogin = e.error.mensaje || 'Error al iniciar sesión';
        }
      });
  }

  logout() {
    this.auth.logout();
    this.usuarioActual = null;
    this.mostrarLogin = true;
    this.correoLogin = '';
    this.contrasenaLogin = '';
  }

  irAlRegistro() {
    this.mostrarLogin = false;
  }

  irAlLogin() {
    this.mostrarLogin = true;
  }
}