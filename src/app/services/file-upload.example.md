# Exemplo de Upload de Arquivos - Game4U API

## Problema Identificado

O erro `"Unexpected token '-', "------WebK"... is not valid JSON"` ocorre quando o front-end envia dados de `multipart/form-data` mas o servidor tenta interpretá-los como JSON.

## Solução: Como Fazer Upload Corretamente

### 1. Front-end (JavaScript/TypeScript)

```javascript
// ❌ INCORRETO - Não fazer isso
const response = await fetch('/user-action/123/attachment', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json', // ❌ Erro!
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ file: file }) // ❌ Erro!
});

// ✅ CORRETO - Fazer assim
const formData = new FormData();
formData.append('files', file); // Chave deve ser 'files' (plural)

const response = await fetch('/user-action/123/attachment', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
    // NÃO definir Content-Type - o navegador define automaticamente como multipart/form-data
  },
  body: formData
});
```

### 2. React Hook Personalizado

```typescript
import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File, 
    userActionId: string, 
    token: string
  ): Promise<UploadResponse> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch(`/user-action/${userActionId}/attachment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Tratar erros tipificados
        switch (errorData.errorType) {
          case 'FILE_TOO_LARGE':
            setError(`Arquivo muito grande. Máximo: ${errorData.details.maxSize} bytes`);
            break;
            
          case 'INVALID_CONTENT_TYPE':
            setError('Erro no envio do arquivo. Verifique o formato.');
            break;
            
          case 'UNAUTHORIZED':
            setError('Sessão expirada. Faça login novamente.');
            break;
            
          default:
            setError(errorData.message || 'Erro no upload do arquivo');
        }
        
        return { success: false, error: errorData.message };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = 'Erro de conexão. Verifique sua internet.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
    clearError: () => setError(null)
  };
}
```

### 3. Componente React de Upload

```tsx
import React, { useRef } from 'react';
import { useFileUpload } from './useFileUpload';

interface FileUploadProps {
  userActionId: string;
  token: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function FileUpload({ userActionId, token, onSuccess, onError }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, error, clearError } = useFileUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearError();

    const result = await uploadFile(file, userActionId, token);
    
    if (result.success) {
      onSuccess?.(result.data);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      onError?.(result.error || 'Erro desconhecido');
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={isUploading}
        accept="image/*,.pdf,.doc,.docx"
      />
      
      {isUploading && <p>Enviando arquivo...</p>}
      
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}
    </div>
  );
}
```

### 4. Vue.js

```vue
<template>
  <div>
    <input 
      type="file" 
      @change="handleFileSelect" 
      :disabled="isUploading"
      accept="image/*,.pdf,.doc,.docx"
    />
    
    <p v-if="isUploading">Enviando arquivo...</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script>
export default {
  props: {
    userActionId: String,
    token: String
  },
  
  data() {
    return {
      isUploading: false,
      error: null
    }
  },
  
  methods: {
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.error = null;
      this.isUploading = true;

      try {
        const formData = new FormData();
        formData.append('files', file);

        const response = await this.$http.put(
          `/user-action/${this.userActionId}/attachment`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          }
        );

        this.$emit('success', response.data);
        event.target.value = ''; // Limpar input

      } catch (error) {
        const errorData = error.response?.data;
        
        if (errorData?.errorType) {
          switch (errorData.errorType) {
            case 'FILE_TOO_LARGE':
              this.error = `Arquivo muito grande. Máximo: ${errorData.details.maxSize} bytes`;
              break;
            case 'INVALID_CONTENT_TYPE':
              this.error = 'Erro no envio do arquivo. Verifique o formato.';
              break;
            default:
              this.error = errorData.message || 'Erro no upload';
          }
        } else {
          this.error = 'Erro de conexão. Verifique sua internet.';
        }
        
        this.$emit('error', this.error);
      } finally {
        this.isUploading = false;
      }
    }
  }
}
</script>
```

### 5. Angular

```typescript
// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File, userActionId: string, token: string): Observable<any> {
    const formData = new FormData();
    formData.append('files', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`/user-action/${userActionId}/attachment`, formData, { headers })
      .pipe(
        catchError(error => {
          if (error.error?.errorType) {
            const errorData = error.error;
            let message = 'Erro no upload';
            
            switch (errorData.errorType) {
              case 'FILE_TOO_LARGE':
                message = `Arquivo muito grande. Máximo: ${errorData.details.maxSize} bytes`;
                break;
              case 'INVALID_CONTENT_TYPE':
                message = 'Erro no envio do arquivo. Verifique o formato.';
                break;
              default:
                message = errorData.message || message;
            }
            
            return throwError(() => new Error(message));
          }
          
          return throwError(() => new Error('Erro de conexão'));
        })
      );
  }
}
```

```typescript
// file-upload.component.ts
import { Component } from '@angular/core';
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-file-upload',
  template: `
    <input 
      type="file" 
      (change)="onFileSelected($event)" 
      [disabled]="isUploading"
      accept="image/*,.pdf,.doc,.docx"
    />
    
    <p *ngIf="isUploading">Enviando arquivo...</p>
    <p *ngIf="error" style="color: red">{{ error }}</p>
  `
})
export class FileUploadComponent {
  isUploading = false;
  error: string | null = null;

  constructor(private fileUploadService: FileUploadService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.error = null;
    this.isUploading = true;

    this.fileUploadService.uploadFile(file, 'user-action-id', 'token')
      .subscribe({
        next: (data) => {
          console.log('Upload successful:', data);
          event.target.value = '';
        },
        error: (error) => {
          this.error = error.message;
        },
        complete: () => {
          this.isUploading = false;
        }
      });
  }
}
```

## Pontos Importantes

1. **NUNCA defina `Content-Type` manualmente** para uploads de arquivo
2. **Use `FormData`** para enviar arquivos
3. **A chave deve ser `files`** (plural) conforme esperado pela API
4. **Trate os erros tipificados** retornados pela API
5. **Verifique o tamanho do arquivo** antes do upload
6. **Use `accept` no input** para limitar tipos de arquivo

## Testando o Upload

Para testar se o upload está funcionando corretamente:

1. Abra o DevTools do navegador (F12)
2. Vá na aba Network
3. Faça o upload de um arquivo
4. Verifique se a requisição tem:
   - `Content-Type: multipart/form-data; boundary=...`
   - O arquivo no FormData
   - Status 200 ou 201 na resposta 