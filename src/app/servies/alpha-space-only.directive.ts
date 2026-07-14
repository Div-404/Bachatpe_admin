import { Directive, ElementRef, HostListener } from '@angular/core';

// @Directive({
//   selector: '[appAlphaSpaceOnly]',
//   standalone:true
// })
// export class AlphaSpaceOnlyDirective {
//   constructor(private el: ElementRef) {}

//   @HostListener('input', ['$event'])
//   onInput(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const sanitized = input.value.replace(/[^A-Za-z ]+/g, '');
//     if (input.value !== sanitized) {
//       input.value = sanitized;
//       input.dispatchEvent(new Event('input'));
//     }
//   }
// }
@Directive({
  selector: '[appAlphaSpaceOnly]',
  standalone: true
})
export class AlphaSpaceOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // Remove non-alphabetic characters except spaces
    let sanitized = input.value.replace(/[^A-Za-z ]/g, '');
    
    // Replace multiple consecutive spaces with single space
    sanitized = sanitized.replace(/\s{2,}/g, ' ');
    
    // Remove leading spaces
    sanitized = sanitized.replace(/^\s+/, '');
    
    if (input.value !== sanitized) {
      input.value = sanitized;
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // Trim trailing spaces on blur
    const trimmed = input.value.trim();
    
    if (input.value !== trimmed) {
      input.value = trimmed;
      input.dispatchEvent(new Event('input'));
    }
  }
}
