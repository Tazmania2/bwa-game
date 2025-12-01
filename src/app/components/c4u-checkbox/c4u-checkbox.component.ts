import { Component, Input, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'c4u-checkbox',
  templateUrl: './c4u-checkbox.component.html',
  styleUrls: ['./c4u-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => C4uCheckboxComponent),
      multi: true
    }
  ]
})
export class C4uCheckboxComponent implements ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() value: boolean = false;
  @Input() checked: boolean = false; // Alias para value para compatibilidade

  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  // Removido @HostListener de click para permitir controle manual via (click) no template
  // O toggle será chamado manualmente quando necessário

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    }
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }

    this.value = !this.value;
    this.checked = this.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.value = value || false;
    this.checked = this.value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get isChecked(): boolean {
    return this.value || this.checked;
  }
}

