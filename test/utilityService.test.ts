import { UtilityService } from "../src/utilityService";

describe("UtilityService.deepClone - Should deeply clone an object even if partial cloning fails", () => {
  let complicatedObject: any;

  beforeEach(() => {
    complicatedObject = {
      level1: {
        array: ["test", "test"],
        level2: {
          array: [["test", "test"]],
          level3: {
            array: [[{ test: "test" }]],
            level4: {
              array: [new Date()],
              level5: {
                array: [
                  [
                    {
                      test(a: any, b: any) {
                        return a + b;
                      },
                    },
                  ],
                ],
                data: "yay",
              },
            },
          },
        },
      },
    };
  });

  test("deepClone clones a data object correctly", () => {
    const clone = UtilityService.deepClone(complicatedObject);
    const reference = JSON.stringify(complicatedObject);
    expect(JSON.stringify(clone) === reference).toBe(true);
  });

  test("deepClone shouldn't clone null, it should return null", () => {
    const clone = UtilityService.deepClone(null);

    expect(clone ? true : false).toBe(false);
  });

  test("deepClone clones a complex object with functions correctly", () => {
    // add a function
    complicatedObject.myFunction = () => "function output";

    // setup data
    const referenceStringify = JSON.stringify(complicatedObject);
    const clone = UtilityService.deepClone(complicatedObject);
    const referenceFunctionOutput = complicatedObject.myFunction();
    const clonedFunctionOutput = clone.myFunction();

    // expect output of both function to be the same
    expect(clonedFunctionOutput === referenceFunctionOutput).toBe(true);

    // expect stringify over the clone (WITH) function to be similar to the stringify before adding a function
    expect(JSON.stringify(clone) === referenceStringify);
  });

  test("deepClone clones a complex object with primitives correctly by removing the primitive", () => {
    // add a primitive into the mix (note, tslint should stop us...)
    // tslint:disable-next-line: no-construct
    complicatedObject.level1.primitive = new String("test");

    const clone = UtilityService.deepClone(complicatedObject);

    // expect the cloning function to have removed the incorrect usage of the primitive:
    expect(
      clone.level1.primitive === String(complicatedObject.level1.primitive),
    ).toBe(true);
  });

  test("deepClone clones a complex object with DOM nodes correctly by invoking cloneNode", () => {
    // add a primitive into the mix (note, tslint should stop us...)
    // tslint:disable-next-line: no-construct
    complicatedObject.dom = {
      nodeType: "domtest",
      cloneNode() {
        return "testAnswer";
      },
    };

    const clone = UtilityService.deepClone(complicatedObject);

    // expect the cloning function to have removed the incorrect usage of the primitive:
    expect(clone.dom === complicatedObject.dom).toBe(false);

    // check whether the cloneNode function of the dom element has been called
    expect(clone.dom === "testAnswer").toBe(true);
  });

  test("deepClone clones a complex object with custom Classes", () => {
    const returnValue = "a";

    const Test = class {
      constructor() {}

      test() {
        return returnValue;
      }
    };

    complicatedObject.class = Test;

    const clone = UtilityService.deepClone(complicatedObject);

    expect(new clone.class().test()).toBe(returnValue);
  });
});

describe("UtilityService.arraysEqual - should compare two arrays and return true if they are equal in content", () => {
  let testArrays: [string[][], number[][]];

  beforeEach(() => {
    testArrays = [
      [
        ["a", "b"],
        ["a", "b"],
      ],
      [
        [1, 2],
        [1, 2],
      ],
    ];
  });

  test("two arrays containing the same data should be compared as truthy", () => {
    testArrays.forEach((arrayOfArrays) => {
      expect(
        UtilityService.arraysEqual(arrayOfArrays[0], arrayOfArrays[1]),
      ).toEqual(true);
    });
  });
  test("comparing the same array should return true", () => {
    testArrays.forEach((arrayOfArrays) => {
      arrayOfArrays.forEach((array: any) => {
        expect(UtilityService.arraysEqual(array, array)).toEqual(true);
      });
    });
  });
  test("comparing arrays with different lengths of sub-data should return false", () => {
    testArrays.forEach((arrayOfArrays) => {
      arrayOfArrays[0] = ["test"];
      expect(
        UtilityService.arraysEqual(arrayOfArrays[0], arrayOfArrays[1]),
      ).toEqual(false);
    });
  });

  test("comparing arrays with different data should return false", () => {
    testArrays.forEach((arrayOfArrays: any) => {
      arrayOfArrays[0][0] = ["test"];
      expect(
        UtilityService.arraysEqual(arrayOfArrays[0], arrayOfArrays[1]),
      ).toEqual(false);
    });
  });

  test("comparing array with null should return false", () => {
    testArrays.forEach((arrayOfArrays) => {
      // @ts-expect-error
      expect(UtilityService.arraysEqual(arrayOfArrays[0], null)).toEqual(false);
    });
  });
});
