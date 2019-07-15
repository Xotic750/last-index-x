let findIndex;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  findIndex = require('../../index.js');
} else {
  findIndex = returnExports;
}

const itHasDoc = typeof document !== 'undefined' && document ? it : xit;

describe('findIndex', function() {
  let list;
  beforeEach(function() {
    list = [5, 10, 15, 20];
  });

  it('should throw when target is null or undefined', function() {
    expect(function() {
      findIndex();
    }).toThrow();

    expect(function() {
      findIndex(void 0);
    }).toThrow();

    expect(function() {
      findIndex(null);
    }).toThrow();
  });

  it('should have a length of 2', function() {
    expect(findIndex).toHaveLength(2);
  });

  it('should find item key by predicate', function() {
    const result = findIndex(list, function(item) {
      return item === 15;
    });
    expect(result).toBe(2);
  });

  it('should return -1 when nothing matched', function() {
    const result = findIndex(list, function(item) {
      return item === 'a';
    });
    expect(result).toBe(-1);
  });

  it('should throw TypeError when function was not passed', function() {
    expect(function() {
      list.findIndex();
    }).toThrow();
  });

  it('should receive all three parameters', function() {
    const index = findIndex(list, function(value, idx, arr) {
      expect(list[idx]).toBe(value);
      expect(list).toStrictEqual(arr);

      return false;
    });
    expect(index).toBe(-1);
  });

  it('should work with the context argument', function() {
    const context = {};
    findIndex(
      [1],
      function() {
        // eslint-disable-next-line no-invalid-this
        expect(this).toBe(context);
      },
      context,
    );
  });

  it('should work with an array-like object', function() {
    const obj = {
      0: 1,
      1: 2,
      2: 3,
      length: 3,
    };

    const foundIndex = findIndex(obj, function(item) {
      return item === 2;
    });

    expect(foundIndex).toBe(1);
  });

  it('should work with an array-like object with negative length', function() {
    const obj = {
      0: 1,
      1: 2,
      2: 3,
      length: -3,
    };

    const foundIndex = findIndex(obj, function(item) {
      throw new Error(`should not reach here ${item}`);
    });

    expect(foundIndex).toBe(-1);
  });

  it('should work with a sparse array', function() {
    // eslint-disable-next-line no-sparse-arrays
    const obj = [1, , void 0];
    expect(1 in obj).toBe(false);
    const seen = [];
    const foundIndex = findIndex(obj, function(item, idx) {
      seen.push([idx, item]);

      return typeof item === 'undefined' && idx === 2;
    });
    expect(foundIndex).toBe(2);
    expect(seen).toStrictEqual([[0, 1], [1, void 0], [2, void 0]]);
  });

  it('should work with a sparse array-like object', function() {
    const obj = {
      0: 1,
      2: void 0,
      length: 3.2,
    };

    const seen = [];
    const foundIndex = findIndex(obj, function(item, idx) {
      seen.push([idx, item]);

      return false;
    });

    expect(foundIndex).toBe(-1);
    expect(seen).toStrictEqual([[0, 1], [1, void 0], [2, void 0]]);
  });

  it('should work with strings', function() {
    const seen = [];
    const foundIndex = findIndex('abc', function(item, idx) {
      seen.push([idx, item]);

      return false;
    });

    expect(foundIndex).toBe(-1);
    expect(seen).toStrictEqual([[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  it('should work with arguments', function() {
    const obj = (function() {
      return arguments;
    })('a', 'b', 'c');

    const seen = [];
    const foundIndex = findIndex(obj, function(item, idx) {
      seen.push([idx, item]);

      return false;
    });

    expect(foundIndex).toBe(-1);
    expect(seen).toStrictEqual([[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  itHasDoc('should work wih DOM elements', function() {
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    fragment.appendChild(div);
    const callback = jasmine.createSpy('callback');
    findIndex(fragment.childNodes, callback);
    expect(callback).toHaveBeenCalledWith(div, 0, fragment.childNodes);
  });
});