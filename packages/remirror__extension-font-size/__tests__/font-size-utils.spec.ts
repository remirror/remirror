import { pixels } from '../src/font-size-utils';

afterEach(() => {
  window.document.documentElement.style.fontSize = '16px';
  window.document.body.textContent = '';
});

test(`no unit conversion`, () => {
  expect(pixels('0')).toBe(0);
});

describe(`absolute units`, () => {
  it(`px unit conversion`, () => {
    expect(pixels('1px')).toBe(1);
  });

  it(`cm unit conversion`, () => {
    expect(pixels('1cm')).toBe(37.795_275_590_551_185);
  });

  it(`mm unit conversion`, () => {
    expect(pixels('1mm')).toBe(3.779_527_559_055_118_5);
  });

  it(`Q unit conversion`, () => {
    expect(pixels('1Q')).toBe(0.944_881_889_763_779_6);
  });

  it(`in unit conversion`, () => {
    expect(pixels('1in')).toBe(96);
  });

  it(`pc unit conversion`, () => {
    expect(pixels('1pc')).toBe(16);
  });

  it(`pt unit conversion`, () => {
    expect(pixels('1pt')).toBe(1.333_333_333_333_333_3);
  });
});

describe(`font-relative units`, () => {
  describe(`rem unit conversion`, () => {
    it(`relative to default root element font size`, () => {
      window.document.documentElement.style.fontSize = '16px';

      expect(pixels('1rem')).toBe(16);
    });

    it(`relative to custom root element font size`, () => {
      window.document.documentElement.style.fontSize = '10px';

      expect(pixels('1rem')).toBe(10);
    });
  });

  describe(`em unit conversion`, () => {
    it(`relative to px font size`, () => {
      const element = document.createElement('div');
      element.style.fontSize = '16px';

      expect(pixels('2em', element)).toBe(32);
    });

    it(`relative to rem font size`, () => {
      const element = document.createElement('div');
      window.document.documentElement.style.fontSize = '16px';
      element.style.fontSize = '2rem';

      expect(pixels('2em', element)).toBe(64);
    });

    it(`relative to em font size in one element`, () => {
      const element = document.createElement('div');
      window.document.body.append(element);
      window.document.documentElement.style.fontSize = '16px';
      element.style.fontSize = '2em';

      expect(pixels('2em', element)).toBe(64);
    });

    it(`relative to em font size in multiple elements`, () => {
      const parentElement = document.createElement('div');
      const element = document.createElement('div');
      parentElement.append(element);
      window.document.body.append(parentElement);
      window.document.documentElement.style.fontSize = '16px';
      parentElement.style.fontSize = '2em';
      element.style.fontSize = '2em';

      expect(pixels('2em', element)).toBe(128);
    });
  });
});

describe(`viewport-relative units`, () => {
  it(`vh unit conversion`, () => {
    expect(pixels('50vh')).toBe(384);
  });

  it(`vw unit conversion`, () => {
    expect(pixels('50vw')).toBe(512);
  });

  it(`vmin unit conversion`, () => {
    expect(pixels('50vmin')).toBe(384);
  });

  it(`vmax unit conversion`, () => {
    expect(pixels('50vmax')).toBe(512);
  });
});
