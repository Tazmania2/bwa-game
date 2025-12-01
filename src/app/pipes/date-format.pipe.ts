import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format dates for Brazilian Portuguese locale
 * Supports various format options:
 * - 'short': DD/MM/YY (e.g., "11/04/23")
 * - 'medium': DD/MM/YYYY (e.g., "11/04/2023")
 * - 'long': DD de MMM de YYYY (e.g., "11 de abr de 2023")
 * - 'monthYear': MMM/YY (e.g., "ABR/23")
 * - 'dateRange': DD/M/YY a DD/M/YY (e.g., "1/4/23 a 30/9/23")
 */
@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  private readonly monthsShort = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
  ];

  private readonly monthsLong = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  transform(value: Date | string | number | null | undefined, format: 'short' | 'medium' | 'long' | 'monthYear' = 'short'): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    switch (format) {
      case 'short':
        return this.formatShort(date);
      case 'medium':
        return this.formatMedium(date);
      case 'long':
        return this.formatLong(date);
      case 'monthYear':
        return this.formatMonthYear(date);
      default:
        return this.formatShort(date);
    }
  }

  private formatShort(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }

  private formatMedium(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatLong(date: Date): string {
    const day = date.getDate();
    const month = this.monthsLong[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }

  private formatMonthYear(date: Date): string {
    const month = this.monthsShort[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  /**
   * Format a date range in the format "DD/M/YY a DD/M/YY"
   * This is a static method to be used directly when needed
   */
  static formatDateRange(startDate: Date, endDate: Date): string {
    const formatDate = (date: Date): string => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    };

    return `${formatDate(startDate)} a ${formatDate(endDate)}`;
  }
}
