import { Filter, FilterItem, FilterService } from "../../src/index";
import { filters, sorts } from "./testData";
/**
 * A test to check whether the page and pagesize are constructed on the url params
 *
 * @param serviceName name of the service that is being tested
 * @param service service that is being tested
 * @param data data for the test to run (optional)
 */
export const pageAndPageSizeFilterTest = (
  serviceName: string,
  service: FilterService<any>,
  data = {
    params: { pageIndex: 2, pageSize: 20 },
    result: "page=3&pageSize=20", // note that page is higher than pageIndex because it isn't an index
    undefinedParams: { pageIndex: undefined, pageSize: undefined },
    undefinedResult: "",
  },
) => {
  const pageAndPageSizeTest = (
    params: { pageIndex?: number; pageSize?: number },
    result: string,
  ) => {
    const { pageIndex, pageSize } = params;
    const serviceResult = service.getPageAndPageSizeFilter(pageIndex, pageSize);
    expect(serviceResult === result).toBe(true);
  };

  test(`${serviceName} correctly sets page and page size filter as url params`, () => {
    pageAndPageSizeTest(data.params, data.result);
  });
  test(`${serviceName} correctly sets page and page size filter as url params when they are undefined`, () => {
    pageAndPageSizeTest(data.undefinedParams, data.undefinedResult);
  });
};

/**
 * A test to check whether the service can correctly form a http url segment
 *
 * @param serviceName name of the service that is being tested
 * @param service service that is being tested
 * @param data data for the test to run (optional)
 */
export const urlSegmentTests = (
  serviceName: string,
  service: FilterService<any>,
  data = {
    params: { field: "test", value: 0 },
    result: "test=0",
    undefinedParams: { field: "test", value: null },
    undefinedResult: "",
  },
) => {
  const urlSegmentTest = (
    params: { field: string; value: number | null },
    result: string,
  ) => {
    const { field, value } = params;
    const serviceResult = service.getUrlSegment(field, value);
    expect(serviceResult === result).toBe(true);
  };

  test(`${serviceName} correctly sets page and page size filter as url params`, () => {
    urlSegmentTest(data.params, data.result);
  });
  test(`${serviceName} correctly sets page and page size filter as url params when they are undefined`, () => {
    urlSegmentTest(data.undefinedParams, data.undefinedResult);
  });
};

/**
 *
 * @param serviceName
 * @param service
 * @param data
 */
export const updateFilterWithPartialTests = (
  serviceName: string,
  service: FilterService<any>,
  data = {
    partialFilterItems: [filters.multipleFieldsSingleValue] as FilterItem[],
    existingFilter: {
      pageIndex: 0,
      pageSize: 20,
      sorts: [sorts.singleSort],
      filters: [filters.singleFieldSingleValue],
    } as Filter,
  },
) => {
  test(`${serviceName} correctly updates a filter with an array of partial filterItems`, () => {
    const mergedFilter = { ...data.existingFilter };
    mergedFilter.filters?.push(filters.multipleFieldsSingleValue);

    const serviceResult = service.UpdateFilterWithPartial(
      data.partialFilterItems,
      data.existingFilter,
    );
    expect(JSON.stringify(serviceResult) === JSON.stringify(mergedFilter)).toBe(
      true,
    );
  });
};

/**
 * Tests whether the services handle extra parameters
 * @param serviceName
 * @param service
 * @param data
 */
export const extraParametersTests = (
  serviceName: string,
  service: FilterService<any>,
  data = {
    filter: {
      pageIndex: 0,
      pageSize: 20,
      sorts: [sorts.singleSort],
      filters: [filters.singleFieldSingleValue],
    } as Filter,
    extraParameters: {
      firstKey: "firstValue",
      secondKey: "secondValue",
    },
    results: {
      firstKey: "firstKey=firstValue",
      secondKey: "secondKey=secondValue",
      orderedUrlResult: "&firstKey=firstValue&secondKey=secondValue",
    },
  },
) => {
  test(`${serviceName} correctly returns a string containing all 'key=value' url segments`, () => {
    const serviceResult = service.getExtraParameters(data.extraParameters);
    expect(serviceResult === data.results.orderedUrlResult).toBeTruthy();
  });

  test(`${serviceName} correctly returns the service value containing the extra params`, () => {
    const serviceResult = service.toValue(data.filter, data.extraParameters);
    expect(serviceResult.includes(data.results.orderedUrlResult)).toBeTruthy();
  });
  test(`${serviceName} ignores null params`, () => {
    const serviceResult = service.toValue(data.filter, {
      ...data.extraParameters,
      ...{ emptyParam: null },
    });
    expect(serviceResult.includes(data.results.orderedUrlResult)).toBeTruthy();
  });
};

/**
 * ShortHand method to call all base class functions
 *
 * @param serviceName
 * @param service
 */
export const AllGenericFilterServiceTests = (
  serviceName: string,
  service: FilterService<any>,
) => {
  pageAndPageSizeFilterTest(serviceName, service);
  urlSegmentTests(serviceName, service);
  updateFilterWithPartialTests(serviceName, service);
  extraParametersTests(serviceName, service);
};

/**
 * A filter test which tests whether combined fields are serialized correctly
 *
 * @param serviceName
 * @param service
 * @param expectedResult
 */
export const combinedFilterFieldsTest = (
  serviceName: string,
  service: FilterService<any>,
  expectedResult: string,
) => {
  test(`${serviceName}.getFilterValue should be able to handle combined fields`, () => {
    const serviceResult = service.getFilterValue({
      filters: [filters.multipleFieldsSingleValue],
    });
    expect(serviceResult === expectedResult).toBe(true);
  });
};

/**
 * A filter test which tests whether multiple values are serialized correctly.
 *
 * @param serviceName
 * @param service
 * @param expectedResult
 */
export const filterWithMultipleValuesTest = (
  serviceName: string,
  service: FilterService<any>,
  expectedResult: string,
) => {
  test(`${serviceName}.getFilterValue should be able to handle multiple values`, () => {
    const serviceResult = service.getFilterValue({
      filters: [filters.singleFieldMultipleValues],
    });
    expect(serviceResult === expectedResult).toBe(true);
  });
};

/**
 * A sorting test.
 *
 * @param serviceName
 * @param service
 * @param expectedResult
 */
export const sortTest = (
  serviceName: string,
  service: FilterService<any>,
  expectedResult: string,
) => {
  test(`${serviceName}.getFilterValue should be able to handle sorts`, () => {
    const serviceResult = service.getFilterValue({
      sorts: [sorts.singleSort],
    });
    expect(serviceResult === expectedResult).toBe(true);
  });
};

/**
 * A filter test which pulls out all the stops :)
 *
 * @param serviceName
 * @param service
 * @param expectedResult
 */
export const filterWithAllOptionsTest = (
  serviceName: string,
  service: FilterService<any>,
  expectedResult: string,
) => {
  test(`${serviceName}.getFilterValue should return a complete, correct filter param url from a Filter with all test cases`, () => {
    const serviceResult = service.getFilterValue({
      pageIndex: 0,
      pageSize: 20,
      sorts: Object.values(sorts),
      filters: Object.values(filters),
    });
    expect(serviceResult === expectedResult).toBe(true);
  });
};
