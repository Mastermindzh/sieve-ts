# Sieve

Node.js/Typescript types and services for [Biarity/Sieve](https://github.com/Biarity/Sieve).

[![Build Status](https://ci.mastermindzh.tech/api/badges/Mastermindzh/sieve-ts/status.svg)](https://ci.mastermindzh.tech/Mastermindzh/sieve-ts)

<!-- toc -->

- [Sieve](#sieve)
  - [HttpParam or Sieve](#httpparam-or-sieve)
  - [Usage](#usage)
    - [Retrieving filter objects from the URL](#retrieving-filter-objects-from-the-url)
    - [Extra/custom parameters](#extracustom-parameters)
  - [Customized Sieve instances](#customized-sieve-instances)

<!-- tocstop -->

## HttpParam or Sieve

If you use the Sieve package for filtering in your (.NET) back-end then you probably only have to look at the `SieveFilterService`.
If however, you use this package for multiple back-ends you can use the `HttpParamFilterService` as the fall-back to use "regular" HTTP-params

## Usage

1. install & import the package:

   ```sh
   yarn add sieve-ts
   ```

   ```ts
    import { Filter, SieveFilterService } from "sieve-ts";
   ```

2. construct a filter using the models:

    ```ts
     const filter = new Filter({
      pageIndex: 2,
      pageSize: 45,
      sorts: [
        {
          field: "testField",
          direction: SortDirection.Ascending,
        },
      ],
      filters: [
        {
          fields: ["firstField", "secondField"],
          values: ["singleValue"],
          operator: Operators.CONTAINS,
        },
      ],
    })
    ```

3. create a service and use it:

    ```ts
    // user either one, both will return a string
    const service = new SieveFilterService();
    const service = new HttpParamService();
    ```

4. use the service to create a usable value:

    ```ts
    console.log(service.toValue(filter));
    ```

5. Observe the output:

    ```ts
    // The Sieve service will have combined the fields together into a single filter:
    page=3&pageSize=45&Filters=(firstField|secondField)@=singleValue&Sorts=testField

    // the HTTP service will simply pass both variables:
    page=3&pageSize=45&firstField=singleValue&secondField=singleValue&testField=+
    ```

### Retrieving filter objects from the URL

You can also give the FilterService the URL query parameter string and have it figure out the filter structure.
Let's try it with a rather complicated query param string: `page=3&pageSize=45&Filters=(firstField|secondField)@=singleValue&Sorts=testField`

```ts
// create service
const sieveService = new SieveFilterService();

// parse filter
const filters = sieveService.parse(
  "page=3&pageSize=45&Filters=(firstField|secondField)@=singleValue&Sorts=testField",
);

// output
console.log(JSON.stringify(filters, null, 2));
```

### Extra/custom parameters

To include extra/custom parameters simply call the `toValue` or `getFilterValue` functions with the optional second argument (key:value):

```ts
console.log(service.toValue(filter, {firstKey: "firstValue", secondKey: "secondValue"}));
```

## Customized Sieve instances

If you have customized parts of your back-end Sieve you can also pass along the custom options to the SieveService.
Let's say we've customized the word "page" to `someOtherWordForPage` and the character to split filter keys from `|` to `~`, our config would look like this:

```ts
  const sieveService = new SieveFilterService({
    ...SIEVE_CONSTANTS,
    page: "someOtherWordForPage",
    keySplitChar: "~",
  });
```

Which would result in the following result instead:

```ts
  someOtherWordForPage=3&pagesize=45&Filters=(firstField~secondField)@=singleValue&Sorts=testField
```
