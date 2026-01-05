import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone: false
})
export class SearchFilterPipe implements PipeTransform {
  /**
   * @param items object from array
   * @param term term's search
   * @param keysToSearch array of keys used to filter the search result
   */
  transform(items: object[], term: string, keysToSearch: any = []): any {
    if (!term || !items) return items;

    const searchRegexp = new RegExp(term, 'i');

    const executeSearch = (value: string | string[]): boolean => {
      if (Array.isArray(value)) {
        return value.some(v => executeSearch(v));
      }
      return searchRegexp.test(value);
    };

    const foundMatch = (item: object) => {
      return Object.entries(item).some(([key, value]) => {
        if (keysToSearch.includes(key)) {
          return executeSearch(value);
        }
        return false;
      });
    };

    return items.filter((item: object) => foundMatch(item));
  }
}
