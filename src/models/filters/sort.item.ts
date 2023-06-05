import { SortDirection } from "./sortDirections";

/**
 * Item to represent a sorting action for the back-end
 */
export class SortItem {
  /**
   * field to sort on
   */
  public field = "";

  /**
   * Direction to sort the field on
   */
  public direction: SortDirection = SortDirection.Descending;
}
