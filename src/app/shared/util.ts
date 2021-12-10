export function toInteger(value: any): number {
    return parseInt(`${value}`, 10);
  }
  
  export function toString(value: any): string {
    return (value !== undefined && value !== null) ? `${value}` : '';
  }
  
  export function getValueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
  }
  
  export function isString(value: any): value is string {
    return typeof value === 'string';
  }
  
  export function isNumber(value: any): value is number {
    return !isNaN(toInteger(value));
  }
  
  export function isInteger(value: any): value is number {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  }
  
  export function isDefined(value: any): boolean {
    return value !== undefined && value !== null;
  }
  
  export function padNumber(value: number) {
    if (isNumber(value)) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }
  
  export function regExpEscape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  
  export function hasClassName(element: any, className: string): boolean {
    return element && element.className && element.className.split &&
        element.className.split(/\s+/).indexOf(className) >= 0;
  }

  export function maxDate(date1: Date, date2: Date): Date {
    if (date1 > date2) {
      return date1;
    } else {
      return date2;
    }
  }

  export function formatTimeSlot(date: Date): string {
    return date.getFullYear()
              + '-' + leftpad(date.getMonth() + 1, 2)
              + '-' + leftpad(date.getDate(), 2)
              + ' ' + leftpad(date.getHours(), 2)
              + ':' + leftpad(date.getMinutes(), 2);
  }
  
  export function leftpad(val, resultLength = 2, leftpadChar = '0'): string {
    return (String(leftpadChar).repeat(resultLength)
          + String(val)).slice(String(val).length);
  }