import { Filter, FilterItem, SortDirection, SortItem } from "../models/index";
import { FilterService } from "./filterService";

export class HttpParamService extends FilterService<string> {
  constructor() {
    super();
  }

  /**
   * Returns all values as field=value
   *
   * @param filter
   */
  public getFilterValue(filter: Filter): string {
    // adds pagination
    let currentFilter = this.getPageAndPageSizeFilter(
      filter.pageIndex,
      filter.pageSize,
    );

    currentFilter += this.addFilters(filter.filters);
    currentFilter += this.addSorts(filter.sorts);

    return currentFilter;
  }

  /** @inheritdoc */
  public getFilter(url: string): Filter {
    throw new Error("Method not implemented.");
  }

  /**
   * Pass all sortitems as SortField=SortDirection
   * direction will be passed as + or -
   *
   * @param sortItems
   */
  private addSorts(sortItems?: SortItem[]): string {
    let sortString = "";

    if (sortItems && sortItems.length > 0) {
      sortItems.forEach((sortItem) => {
        sortString += `&${this.getUrlSegment(
          sortItem.field,
          sortItem.direction === SortDirection.Descending ? "-" : "+",
        )}`;
      });
    }
    return sortString;
  }

  /**
   * Add all filterItems as filterField=Value.
   * Add duplicate field/value declaration if multiple values exist.
   *
   * @param filterItems
   */
  private addFilters(filterItems?: FilterItem[]): string {
    let filterString = "";

    if (filterItems) {
      filterItems.forEach((filterItem) => {
        if (filterItem.fields) {
          filterItem.fields.forEach((field) => {
            filterItem.values?.forEach((value) => {
              const segment = this.getUrlSegment(field, value);
              if (segment) {
                filterString += `&${segment}`;
              }
            });
          });
        }
      });
    }

    return filterString;
  }
}
