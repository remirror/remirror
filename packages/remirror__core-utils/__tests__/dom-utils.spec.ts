import { extractPixelSize } from '../';

afterEach(() => {
  window.document.documentElement.style.fontSize = '16px';
  window.document.body.textContent = '';
  Object.assign(window, { innerWidth: 1024 });
});

test(`no unit conversion`, () => {
  expect(extractPixelSize('0')).toBe(0);
});

describe(`absolute units`, () => {
  it(`px unit conversion`, () => {
    expect(extractPixelSize('1px')).toBe(1);
  });

  it(`cm unit conversion`, () => {
    expect(extractPixelSize('1cm')).toBe(37.795_275_590_551_185);
  });

  it(`mm unit conversion`, () => {
    expect(extractPixelSize('1mm')).toBe(3.779_527_559_055_118_5);
  });

  it(`Q unit conversion`, () => {
    expect(extractPixelSize('1Q')).toBe(0.944_881_889_763_779_6);
  });

  it(`in unit conversion`, () => {
    expect(extractPixelSize('1in')).toBe(96);
  });

  it(`pc unit conversion`, () => {
    expect(extractPixelSize('1pc')).toBe(16);
  });

  it(`pt unit conversion`, () => {
    expect(extractPixelSize('1pt')).toBe(1.333_333_333_333_333_3);
  });
});

describe(`font-relative units`, () => {
  describe(`rem unit conversion`, () => {
    it(`relative to default root element font size`, () => {
      window.document.documentElement.style.fontSize = '16px';

      expect(extractPixelSize('1rem')).toBe(16);
    });

    it(`relative to custom root element font size`, () => {
      window.document.documentElement.style.fontSize = '10px';

      expect(extractPixelSize('1rem')).toBe(10);
    });
  });

  describe(`em unit conversion`, () => {
    it(`relative to px font size`, () => {
      const element = document.createElement('div');
      element.style.fontSize = '16px';

      expect(extractPixelSize('2em', element)).toBe(32);
    });

    it(`relative to rem font size`, () => {
      const element = document.createElement('div');
      window.document.documentElement.style.fontSize = '16px';
      element.style.fontSize = '2rem';

      expect(extractPixelSize('2em', element)).toBe(64);
    });

    it(`relative to em font size in one element`, () => {
      const element = document.createElement('div');
      window.document.body.append(element);
      window.document.documentElement.style.fontSize = '16px';
      element.style.fontSize = '2em';

      expect(extractPixelSize('2em', element)).toBe(64);
    });

    it(`relative to em font size in multiple elements`, () => {
      const parentElement = document.createElement('div');
      const element = document.createElement('div');
      parentElement.append(element);
      window.document.body.append(parentElement);
      window.document.documentElement.style.fontSize = '16px';
      parentElement.style.fontSize = '2em';
      element.style.fontSize = '2em';

      expect(extractPixelSize('2em', element)).toBe(128);
    });
  });
});

describe(`viewport-relative units`, () => {
  it(`vh unit conversion`, () => {
    expect(extractPixelSize('50vh')).toBe(384);
  });

  it(`vw unit conversion`, () => {
    expect(extractPixelSize('50vw')).toBe(512);
  });

  it(`vmin unit conversion`, () => {
    expect(extractPixelSize('50vmin')).toBe(384);
  });

  it(`vmax unit conversion`, () => {
    expect(extractPixelSize('50vmax')).toBe(512);
  });
});

describe('CSS functions', () => {
  describe('min()', () => {
    it(`pixels`, () => {
      expect(extractPixelSize('min(1px, 2px)')).toBe(1);
    });

    it(`relative units`, () => {
      window.document.documentElement.style.fontSize = '10px';
      expect(extractPixelSize('min(5rem, 10rem)')).toBe(50);
    });

    it(`mixed units`, () => {
      expect(extractPixelSize('min(50vh, 50vw)')).toBe(384);
    });
  });

  describe('max()', () => {
    it(`pixels`, () => {
      expect(extractPixelSize('max(1px, 2px)')).toBe(2);
    });

    it(`relative units`, () => {
      window.document.documentElement.style.fontSize = '10px';
      expect(extractPixelSize('max(5rem, 10rem)')).toBe(100);
    });

    it(`mixed units`, () => {
      expect(extractPixelSize('max(50vh, 50vw)')).toBe(512);
    });
  });

  describe('clamp()', () => {
    it(`pixels`, () => {
      expect(extractPixelSize('clamp(1px, 2px, 3px)')).toBe(2);
    });

    it(`relative units`, () => {
      window.document.documentElement.style.fontSize = '10px';
      expect(extractPixelSize('clamp(1rem, 3rem, 10rem)')).toBe(30);
    });

    it(`mixed units`, () => {
      window.document.documentElement.style.fontSize = '16px';
      expect(extractPixelSize('clamp(5rem, 10vw, 10rem)')).toBe(102.4);
    });

    it(`constrains values`, () => {
      Object.assign(window, { innerWidth: 768 });
      expect(extractPixelSize('clamp(5rem, 10vw, 10rem)')).toBe(80);
      Object.assign(window, { innerWidth: 2048 });
      expect(extractPixelSize('clamp(5rem, 10vw, 10rem)')).toBe(160);
    });
  });

  describe('nested functions', () => {
    it(`pixels`, () => {
      expect(extractPixelSize('max(1px, min(2px, 3px))')).toBe(2);
    });

    it(`relative units`, () => {
      window.document.documentElement.style.fontSize = '10px';
      expect(extractPixelSize('max(1rem, min(3rem, 10rem))')).toBe(30);
    });

    it(`mixed units`, () => {
      window.document.documentElement.style.fontSize = '16px';
      expect(extractPixelSize('max(1rem, min(10vw, 2rem))')).toBe(32);
    });
  });
});
