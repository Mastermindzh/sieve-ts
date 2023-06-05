import { HttpParamService } from "../src/index";
import {
  AllGenericFilterServiceTests,
  combinedFilterFieldsTest,
  filterWithAllOptionsTest,
  filterWithMultipleValuesTest,
  sortTest,
} from "./helpers/filterServiceTests";

const serviceName = "HttpParamFilter";
const service: HttpParamService = new HttpParamService();

describe(`${serviceName} - base class tests`, () => {
  // run generic tests on this service to make sure any overrides still work as expected :)
  AllGenericFilterServiceTests(serviceName, service);
});

describe(`${serviceName} - shared filter and sorting tests`, () => {
  // generic filters
  combinedFilterFieldsTest(
    serviceName,
    service,
    "&combinedField=combinedFieldValue&combinedField2=combinedFieldValue",
  );
  filterWithMultipleValuesTest(
    serviceName,
    service,
    "&combinedValue=combinedValue1&combinedValue=combinedValue2",
  );
  sortTest(serviceName, service, "&test=+");
  filterWithAllOptionsTest(
    serviceName,
    service,
    "page=1&pageSize=20&firstField=firstValue&combinedField=combinedFieldValue&combinedField2=combinedFieldValue&combinedValue=combinedValue1&combinedValue=combinedValue2&everythingCombined1=everythingCombinedValue1&everythingCombined1=everythingCombinedValue2&everythingCombined2=everythingCombinedValue1&everythingCombined2=everythingCombinedValue2&test=+&sortField1=-",
  );
});

describe(`${serviceName} - custom tests`, () => {
  test(`${serviceName}.getFilter should throw an error`, () => {
    expect(() => service.getFilter("anything")).toThrow();
  });
});
