import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SessaoProvider } from './sessao/sessao.provider';

@Injectable({ providedIn: 'root' })
export class ApiProvider {
  public defaultHeaders = {
    'Content-Type': 'application/json',
  };

  constructor(private http: HttpClient, private sessao: SessaoProvider) {}

  private async chamadaApi<T>(
    path: string,
    method: string,
    headers: any = this.defaultHeaders,
    body?: any,
    params?: Object
  ): Promise<T> {
    let url = encodeURI(path.startsWith("https") ? path : (environment.backend_url_base + path));

    return new Promise<T>((resolve, reject) => {
      const options: any = { headers: { ...headers, ...this.defaultHeaders } };

      if (body) options.body = body;
      if (params) options.params = params;
      const request = this.http.request(method, url, options);

      request.subscribe({
        next: (response) => {
          resolve(<T>response);
        },
        error: (error) => {
          if (error && (error.status === 401 || error.status === 403))
            this.sessao.logout();
          reject(error);
        },
      });
    });
  }

  public async get<T>(path: string, options?: { headers?: Object, params?: Object }): Promise<T> {
    return this.chamadaApi(path, 'GET', options?.headers, undefined, options?.params);
  }

  public async put<T>(
    path: string,
    body: Object,
    headers?: Object
  ): Promise<T> {
    return this.chamadaApi(path, 'PUT', headers, body);
  }

  public async post<T>(
    path: string,
    body: Object,
    headers?: Object
  ): Promise<T> {
    return this.chamadaApi(path, 'POST', headers, body);
  }

  public async patch<T>(
    path: string,
    body: Object,
    headers?: Object
  ): Promise<T> {
    return this.chamadaApi(path, 'PATCH', headers, body);
  }
}
