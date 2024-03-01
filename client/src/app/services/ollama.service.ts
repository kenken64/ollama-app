import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OllamaService {

  constructor(private http:HttpClient) { }

  chatwithOllama(message:string): Promise<any>{
    message = message.trim();
    const options = message ? {params: 
            new HttpParams().set('message', message)} : {};

    const url = '/api/chat';
    return lastValueFrom(this.http.get(url, options));
  }

  uploadFile(data:FormData): Promise<any>{
    return lastValueFrom(this.http.post("/api/upload", data));
  }
}
