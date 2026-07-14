import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousand'
})
export class ThousandPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    if (value === null || value === undefined) {
      return '';
    }
    var returnValue;
    if (value > 999) {


      const suffix = 'k';
      const formattedValue = value / 1000;
      returnValue = `${formattedValue.toFixed(1)}${suffix}`;
    }
    else {
      returnValue = JSON.stringify(value)

    }
    return returnValue;
  }
}