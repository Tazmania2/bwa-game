import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format numbers with thousand separators for Brazilian Portuguese locale
 * Example: 12000 -> "12.000"
 */
@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }

    return value.toLocaleString('pt-BR');
  }
}
