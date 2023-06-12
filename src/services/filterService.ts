import { ExtraParameters } from "../models/extraParameters";
import { Filter, FilterItem } from "../models/index";
import { UtilityService } from "../utilityService";

export abstract class FilterService<T> {
  /**
   * Given a filter return the constructed filter
   *
   * @param filter
   */
  public abstract getFilterValue(
    filter: Filter,
    extraParams?: ExtraParameters,
  ): T;

  /**
   * Given a filter return the constructed filter
   *
   * @param filter
   */
  public toValue(filter: Filter, extraParams?: ExtraParameters): T {
    return this.getFilterValue(filter, extraParams);
  }

  /**
   * Given an url, or a param string this method will return a Filter
   *
   * @param url entire url, or just the route part.
   */
  public abstract getFilter(url: T | string): Filter;

  /**
   * Given an url, or a param string this method will return a Filter
   *
   * @param url entire url, or just the route part.
   */
  public parse(url: T | string): Filter {
    return this.getFilter(url);
  }

  /**
   * Update an existing filter with partial filterItems
   * use this if you add custom filters
   *
   * @param partialFilter
   */
  public UpdateFilterWithPartial(
    partialFilter: FilterItem[],
    originalFilter: Filter,
  ): Filter {
    const returnFilter: Filter = UtilityService.deepClone(originalFilter);

    const filterItems: FilterItem[] = returnFilter.filters
      ? returnFilter.filters
      : [];

    partialFilter.forEach((filter) => {
      const index = filterItems.findIndex((f) =>
        UtilityService.arraysEqual(f.fields, filter.fields),
      );
      if (index !== -1) {
        filterItems.splice(index, 1);
      }
      filterItems.push(filter);
    });

    returnFilter.filters = filterItems;

    return returnFilter;
  }

  /**
   * Creates a part of the filterstring based on pageIndex and pagesize.
   * In the process it replaces pageIndex (0-based) with page (1-based)
   *
   * @param {number | undefined} pageIndex index (0 based) of the page you want to get
   * @param {number | undefined} pageSize size of the page you want to get
   * @return {string}  filter segment for page and pagesize
   */
  public getPageAndPageSizeFilter(pageIndex?: number, pageSize?: number) {
    const page = pageIndex || pageIndex === 0 ? pageIndex + 1 : "";
    const pageSegment = this.getUrlSegment("page", page);
    const pageSizeSegment = this.getUrlSegment("pageSize", pageSize ?? "");
    const pageAndPageSize = pageSegment && pageSizeSegment;
    return `${pageSegment}${pageAndPageSize && "&"}${pageSizeSegment}`;
  }

  /**
   * Return a url param fragment
   * e.g param=value
   *
   * @param param
   * @param value
   */
  public getUrlSegment(param: string, value: string | number | null) {
    if (value || value === 0) {
      return `${param}=${value}`;
    }
    return "";
  }

  /**
   * Return a url fragment with extra parameters.
   * e.g param=value&param2=2
   *
   * @param param
   * @param value
   */
  public getExtraParameters(extraParameters: ExtraParameters) {
    return Object.entries(extraParameters).reduce((previous, [key, value]) => {
      const segment = this.getUrlSegment(key, value);
      if (segment) {
        return `${previous}&${segment}`;
      }
      return previous;
    }, "");
  }
}
