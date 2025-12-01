import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SessaoProvider } from './sessao/sessao.provider';

@Injectable({ providedIn: 'root' })
export class LoadingProvider {
  public show: boolean = false;
}
