export class UtilityService {
  // BEGIN-NOSCAN
  /**
   * Clones an entire JS object including functions etc
   * from: https://stackoverflow.com/a/4460624
   *
   * @param item
   */
  public static deepClone(item: any) {
    if (!item) {
      return item;
    } // null, undefined values check

    const types = [Number, String, Boolean, Symbol];
    let result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
      if (item instanceof type) {
        result = type(item);
      }
    });

    if (typeof result === "undefined") {
      if (Object.prototype.toString.call(item) === "[object Array]") {
        result = [];
        item.forEach(function (child: any, index: number) {
          result[index] = UtilityService.deepClone(child);
        });
      } else if (typeof item === "object") {
        // testing that this is DOM
        if (item.nodeType && typeof item.cloneNode === "function") {
          result = item.cloneNode(true);
        } else if (!item.prototype) {
          // check that this is a literal
          if (item instanceof Date) {
            result = new Date(item);
          } else {
            // it is an object literal
            result = {};
            // tslint:disable-next-line: forin
            for (const i in item) {
              // @ts-ignore
              result[i] = UtilityService.deepClone(item[i]);
            }
          }
        } else {
          result = item;
        }
      } else {
        result = item;
      }
    }

    return result;
  }

  // END-NOSCAN

  /**
   * Check whether two arrays are equal
   *
   * @param a first array
   * @param b second array
   */
  public static arraysEqual(a: any[], b: any[]) {
    if (a === b) {
      return true;
    }

    if (a == null || b == null) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }
}
