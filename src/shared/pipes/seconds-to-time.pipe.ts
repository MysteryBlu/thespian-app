import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'secondsToTime',
  standalone: true
})
export class SecondsToTime implements PipeTransform {
  transform(value: number): string {
    if (!value && value !== 0) {
      return '';
    }

    const minutes: number = Math.floor(value / 60);
    const seconds: number = Math.floor(value % 60);

    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}