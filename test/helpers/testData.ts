import { Operators, SortDirection } from "../../src/index";

/**
 * Sort items used in tests
 */
export const sorts = {
  singleSort: { field: "test", direction: SortDirection.Ascending },
  anotherSort: { field: "sortField1", direction: SortDirection.Descending },
};

/**
 * Filters used in tests
 */
export const filters = {
  singleFieldSingleValue: {
    fields: ["firstField"],
    values: ["firstValue"],
    operator: Operators.EQUALS,
  },
  multipleFieldsSingleValue: {
    fields: ["combinedField", "combinedField2"],
    values: ["combinedFieldValue"],
    operator: Operators.CASE_INSENSITIVE_STRING_CONTAINS,
  },
  singleFieldMultipleValues: {
    fields: ["combinedValue"],
    values: ["combinedValue1", "combinedValue2"],
    operator: Operators.CONTAINS,
  },
  multipleFieldsMultipleValues: {
    fields: ["everythingCombined1", "everythingCombined2"],
    values: ["everythingCombinedValue1", "everythingCombinedValue2"],
    operator: Operators.DOES_NOT_START_WITH,
  },
};
