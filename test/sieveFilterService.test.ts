import {
  Filter,
  HttpParamService,
  Operators,
  SieveFilterService,
  SortDirection,
} from "../src/index";

import {
  AllGenericFilterServiceTests,
  combinedFilterFieldsTest,
  filterWithAllOptionsTest,
  filterWithMultipleValuesTest,
  sortTest,
} from "./helpers/filterServiceTests";

const serviceName = "SieveFilterService";
const service: SieveFilterService = new SieveFilterService();

describe(`${serviceName} - base class tests`, () => {
  // run generic tests on this service to make sure any overrides still work as expected :)
  AllGenericFilterServiceTests(serviceName, service);
});

describe(`${serviceName} - shared filter and sorting tests`, () => {
  combinedFilterFieldsTest(
    serviceName,
    service,
    "&Filters=(combinedField|combinedField2)@=*combinedFieldValue",
  );
  filterWithMultipleValuesTest(
    serviceName,
    service,
    "&Filters=combinedValue@=combinedValue1|combinedValue2",
  );
  sortTest(serviceName, service, "&Sorts=test");
  filterWithAllOptionsTest(
    serviceName,
    service,
    "page=1&pageSize=20&Filters=firstField==firstValue,(combinedField|combinedField2)@=*combinedFieldValue,combinedValue@=combinedValue1|combinedValue2,(everythingCombined1|everythingCombined2)!_=everythingCombinedValue1|everythingCombinedValue2&Sorts=test,-sortField1",
  );


describe(`${serviceName} - custom tests`, () => {
  test(`${serviceName}.getFilter should be able to extract page info from an url`, () => {
    const page = 1;
    const pageSize = 20;

    const serviceResult = service.getFilter(
      `?Page=${page}&PageSiZe=${pageSize}`,
    );
    expect(serviceResult.pageIndex).toBe(page - 1);
    expect(serviceResult.pageSize).toBe(pageSize);
  });
  test(`${serviceName}.getFilter should be able to extract sorting info from an url`, () => {
    const serviceResult = service.getFilter("&Sorts=test,-sortField1");
    const expectedResult = JSON.stringify([
      { field: "test", direction: SortDirection.Ascending },
      { field: "sortField1", direction: SortDirection.Descending },
    ]);

    expect(JSON.stringify(serviceResult.sorts)).toBe(expectedResult);
  });

  test(`${serviceName}.getFilter should be able to extract filters from an url`, () => {
    const serviceResult = service.getFilter(
      "?Filters=combinedValue@=*combinedValue1",
    );
    const expectedResult = JSON.stringify([
      {
        fields: ["combinedValue"],
        values: ["combinedValue1"],
        operator: Operators.CASE_INSENSITIVE_STRING_CONTAINS,
      },
    ]);

    expect(JSON.stringify(serviceResult.filters)).toBe(expectedResult);
  });

  test(`${serviceName}.getFilter should be able to extract filters with multiple keys and multiple values`, () => {
    const serviceResult = service.getFilter(
      "?Filters=(key1|key2|key3)@=*value1|value2",
    );
    const expectedResult = JSON.stringify([
      {
        fields: ["key1", "key2", "key3"],
        values: ["value1", "value2"],
        operator: Operators.CASE_INSENSITIVE_STRING_CONTAINS,
      },
    ]);

    expect(JSON.stringify(serviceResult.filters)).toBe(expectedResult);
  });

  test(`${serviceName}.getFilter should be able to extract filters with multiple keys, multiple values, multiple sorts and page/pagesize`, () => {
    const page = 1;
    const pageSize = 20;
    const expectedSortResult = JSON.stringify([
      { field: "test", direction: SortDirection.Ascending },
      { field: "sortField1", direction: SortDirection.Descending },
    ]);
    const expectedFilterResult = JSON.stringify([
      {
        fields: ["key1", "key2", "key3"],
        values: ["value1", "value2"],
        operator: Operators.CASE_INSENSITIVE_STRING_CONTAINS,
      },
    ]);

    const serviceResult = service.getFilter(
      `?Page=${page}&PageSiZe=${pageSize}&Sorts=test,-sortField1&Filters=(key1|key2|key3)@=*value1|value2`,
    );

    expect(serviceResult.pageIndex).toBe(page - 1);
    expect(serviceResult.pageSize).toBe(pageSize);
    expect(JSON.stringify(serviceResult.sorts)).toBe(expectedSortResult);
    expect(JSON.stringify(serviceResult.filters)).toBe(expectedFilterResult);
  });
});
