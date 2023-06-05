/**
 * Item to represent a filter action for the back-end
 */
export interface FilterItem {
  /**
   * Array of fields to filter on.
   */
  fields: string[];

  /**
   * Array of values where the fields have to be filtered on
   */
  values: Array<string | null>;

  /**
   * Operator to use for the filter
   * e.g == or @=*
   */
  operator: string;
}
