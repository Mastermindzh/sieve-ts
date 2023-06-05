import { FilterItem } from "./filter.item";
import { SortItem } from "./sort.item";

const defaults = { pageIndex: 0, pageSize: 20, filters: [], sorts: [] };
/**
 * A standard filter object for most pages
 */
export class Filter {
  public constructor(
    options: {
      pageIndex?: number;
      pageSize?: number;
      filters?: FilterItem[];
      sorts?: SortItem[];
    } = defaults,
  ) {
    const objectOptions = { ...defaults, ...options };
    this.pageIndex = objectOptions?.pageIndex;
    this.pageSize = objectOptions?.pageSize;
    this.filters = objectOptions?.filters;
    this.sorts = objectOptions?.sorts;
  }

  /**
   * The index (0-based) of the page that you want to request: default: 0
   */
  public pageIndex?: number = 0;

  /**
   * Page size, default: 20
   */
  public pageSize?: number = 20;

  /**
   * Array of filterItems, used to denote what kind of filters are present
   */
  public filters?: FilterItem[] = [];

  /**
   * Array of sortItems, used to denote what kind of sortings are present
   */
  public sorts?: SortItem[] = [];
}
