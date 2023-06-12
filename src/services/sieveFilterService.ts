import {
  ExtraParameters,
  Filter,
  FilterItem,
  Operators,
  SortDirection,
  SortItem,
} from "../models/index";

import { SIEVE_CONSTANTS } from "../models/sieveConstants";
import { FilterService } from "./filterService";

/**
 * FilterService to transform filters for http calls using SIEVE
 *
 * Example sieve:
 * ?sorts=     LikeCount,CommentCount,-created         // sort by likes, then comments, then descending by date created
 * &filters=   LikeCount>10, Title@=awesome title,     // filter to posts with more than 10 likes, and a title that contains the phrase "awesome title"
 * &page=      1                                       // get the first page...
 * &pageSize=  10                                      // ...which contains 10 posts
 */
export class SieveFilterService extends FilterService<string> {
  private sieveConstants = SIEVE_CONSTANTS;
  constructor(sieveConstants?: typeof SIEVE_CONSTANTS) {
    super();
    if (sieveConstants) {
      this.sieveConstants = sieveConstants;
    }
  }

  /**
   * Returns a fully formatted sieve filter string
   *
   * @param filter filter to generate string from
   * @param extraParameters extra key/value pairs to add onto the return value
   */
  public getFilterValue(
    filter: Filter,
    extraParameters?: ExtraParameters,
  ): string {
    // adds pagination
    let currentFilter = this.getPageAndPageSizeFilter(
      filter.pageIndex,
      filter.pageSize,
    );

    currentFilter += this.addFilters(filter.filters);
    currentFilter += this.addSorts(filter.sorts);

    if (extraParameters) {
      currentFilter += this.getExtraParameters(extraParameters);
    }
    return currentFilter;
  }

  /** @inheritdoc */
  public getFilter(url: string): Filter {
    const params = url.split("?")[1] ?? url;
    const pairs = params?.split("&");
    const filter: Filter = {};
    const parametersAsObject = Object.fromEntries(
      pairs
        ?.map((pair) => pair.split(/=(.+)/))
        ?.map(([key, value]) => [key.toLowerCase(), value]) ?? [],
    );

    for (const [key, value] of Object.entries(parametersAsObject)) {
      switch (key) {
        case "page":
          filter.pageIndex = Number(value) - 1;
          break;
        case "pagesize":
          filter.pageSize = Number(value);
          break;
        case "filters":
          const filterString = value;
          filter.filters = this.parseFilters(filterString);
          break;
        case "sorts":
          filter.sorts = this.parseSorts(value);
          break;
      }
    }
    return filter;
  }

  /**
   * Function to parse the "&Filters=" part of an URI
   *
   * @param filters part of the URI to filter
   * @returns Array of filterItems constructed from the URI
   */
  private parseFilters(
    filters: string,
    operators: { [key: string]: string } = Operators,
  ): FilterItem[] {
    const operatorRegex = (() => {
      /**
       * This anonymous function takes the Operator enum and constructs a regex which will match all operators defined in Operator
       * at the point of writing it looks like this: /(!@=\*)+|(!_=\*)+|(!_=)+|(@=\*)+|(_=\*)+|(==\*)+|(!=\*)+|(==)+|(!=)+|(>=)+|(<=)+|(@=)+|(_=)+|(>)+|(<)+/
       *
       * @param operators a string enum containing all the operators
       * @returns regex that matches all operators from the enum. F.e
       */

      /**
       * for any user entered value, we should escape all the "regex" characters with backslashes
       *
       * @param val user entered value
       * @returns user entered value with all special regex characters escaped with a \
       */
      const escapeRegexValue = (val: string) =>
        val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      return new RegExp(
        Object.values(operators)
          // sort on length desc, so that the longest keys are checked first. (@= will match @=* as well)
          .sort((a, b) => b.length - a.length)
          // construct the regex
          .reduce((previous: string, current: string, currentIndex: number) => {
            const previousValue =
              currentIndex === 1
                ? `(${escapeRegexValue(previous)})+`
                : `${previous}`;
            return `${previousValue}|(${escapeRegexValue(current)})+`;
          }),
      );
    })();

    /**
     * Local function to remove parentheses from any string
     *
     * @param val string with optional parentheses
     * @returns string without parentheses
     */
    const removeParentheses = (val: string) => val.replace(/([()])/g, "");

    return filters.split(this.sieveConstants.splitChar).map((pair) => {
      const filterInfo = pair
        .split(operatorRegex)
        .filter((x) => x !== undefined);
      if (filterInfo.length !== 3) {
        throw new Error("can't parse one of the filterItems");
      }
      return {
        fields: removeParentheses(filterInfo[0]).split(
          this.sieveConstants.keySplitChar,
        ),
        values: filterInfo[2].split(this.sieveConstants.valueSplitChar),
        operator: filterInfo[1],
      } as FilterItem;
    });
  }

  /**
   * Function to parse the "&sorts=" part of an URI
   *
   * @param sort part of the URI to filter
   * @returns Array of SortItems constructed from the URI
   */
  private parseSorts(sorts: string): SortItem[] {
    return sorts?.split(this.sieveConstants.splitChar).map((sort) => {
      const firstChar = sort.charAt(0);
      if (firstChar === "-") {
        return {
          field: sort.substring(1),
          direction: SortDirection.Descending,
        };
      } else {
        return { field: sort, direction: SortDirection.Ascending };
      }
    });
  }

  /**
   * Create a sieve &Sorts= string based on the sortItems
   *
   * @param sortItems
   */
  private addSorts(sortItems?: SortItem[]): string {
    let sortString = "";

    if (sortItems && sortItems.length > 0) {
      sortString += "&Sorts=";
      sortItems.forEach((sortItem, index) => {
        sortString += `${
          sortItem.direction === SortDirection.Descending ? "-" : ""
        }${sortItem.field}`;
        if (index !== sortItems.length - 1) {
          sortString += this.sieveConstants.splitChar;
        }
      });
    }
    return sortString;
  }

  /**
   * Create a sieve &Filters= string based on the filterItems
   *
   * @param filterItems
   */
  private addFilters(filterItems?: FilterItem[]): string {
    let filterString = "";
    let filterBitSet = false;

    if (!filterItems) {
      return filterString;
    }

    filterItems.forEach((feFilter) => {
      // check whether every value for this filter is not null (null == undefined is true, so this works for both)
      if (
        feFilter?.values?.filter(
          (v) => v === null || v === "" || v === undefined,
        ).length === 0
      ) {
        // check whether we already added &Filters=
        if (!filterBitSet) {
          filterBitSet = true;
          filterString += "&Filters=";
        } else {
          // if filter has been added this will be an additional filter (separated by ,)
          filterString += this.sieveConstants.splitChar;
        }

        // add filter field(s)
        if (feFilter.fields?.length > 1) {
          filterString = this.addFilterStringGroup(filterString, feFilter);
        } else {
          filterString += feFilter.fields[0];
        }

        // add the operator
        filterString += feFilter.operator;

        // add filter values
        filterString = this.addFilterValues(feFilter, filterString);
      }
    });

    return filterString;
  }

  /**
   * Add filter as group of filter keys
   * @param filterString
   * @param feFilter
   * @returns
   */
  private addFilterStringGroup(filterString: string, feFilter: FilterItem) {
    filterString += "(";
    feFilter.fields.forEach((name, index) => {
      filterString += name;
      if (index !== feFilter.fields.length - 1) {
        filterString += this.sieveConstants.keySplitChar;
      }
    });
    filterString += ")";
    return filterString;
  }

  /**
   * Add values to filter
   * @param feFilter
   * @param filterString
   * @returns
   */
  private addFilterValues(feFilter: FilterItem, filterString: string) {
    feFilter.values.forEach((value, index) => {
      filterString += value;
      if (index !== feFilter.values.length - 1) {
        filterString += this.sieveConstants.valueSplitChar;
      }
    });
    return filterString;
  }

  /**
   * Creates a part of the filterstring based on pageIndex and pagesize.
   * In the process it replaces pageIndex (0-based) with page (1-based)
   *
   * @param {number | undefined} pageIndex index (0 based) of the page you want to get
   * @param {number | undefined} pageSize size of the page you want to get
   * @return {string}  filter segment for page and pagesize
   */
  override getPageAndPageSizeFilter(pageIndex?: number, pageSize?: number) {
    const page = pageIndex || pageIndex === 0 ? pageIndex + 1 : "";
    const pageSegment = this.getUrlSegment(this.sieveConstants.page, page);
    const pageSizeSegment = this.getUrlSegment(
      this.sieveConstants.pageSize,
      pageSize ?? "",
    );
    const pageAndPageSize = pageSegment && pageSizeSegment;
    return `${pageSegment}${pageAndPageSize && "&"}${pageSizeSegment}`;
  }
}
