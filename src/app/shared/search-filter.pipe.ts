import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false,
})
@Injectable()
export class SearchFilterPipe implements PipeTransform {
  /**
   * @param items object from array
   * @param term term's search
   * @param includes array of keys used to filter the search result
   */
  transform(items: any, term: string, includes: any = []): any {
    if (!term || !items) return items;

    return SearchFilterPipe.filter(items, term, includes);
  }

  /**
   *
   * @param items List of items to filter
   * @param term  a string term to compare with every property of the list
   * @param includes List of keys used to filter the search result
   *
   */
  static filter(
    items: Array<{ [key: string]: any }>,
    term: string,
    includes: any
  ): Array<{ [key: string]: any }> {
    const toCompare = term.toLowerCase();

    function checkInside(item: any, term: string) {
      if (
        typeof item === 'string' &&
        item.toString().toLowerCase().includes(toCompare)
      ) {
        return true;
      }
      for (const property in item) {
        if (!property.hasOwnProperty(item)) {
          //should skip this item?
          let skipItem = false;
          if (includes !== null && includes.length > 0) {
            skipItem = !includes.includes(property);
          }
          if (
            item[property] === null ||
            item[property] === undefined ||
            skipItem
          ) {
            continue;
          }
          if (typeof item[property] === 'object') {
            if (checkInside(item[property], term)) {
              return true;
            }
          } else if (
            item[property].toString().toLowerCase().includes(toCompare)
          ) {
            return true;
          }
        }
      }

      return false;
    }

    return items.filter(function (item) {
      return checkInside(item, term);
    });
  }
}
