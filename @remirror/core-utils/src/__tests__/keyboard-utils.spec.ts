import { mod } from '../keyboard-utils';

describe('mod', () => {
  it('should run on PC', () => {
    const isMac = () => false;
    expect(mod('Primary', 'Enter', isMac)).toBe('Control-Enter');
    expect(mod('PrimaryShift', 'Enter', isMac)).toBe('Control-Shift-Enter');
    expect(mod('PrimaryAlt', 'Enter', isMac)).toBe('Control-Alt-Enter');
    expect(mod('Secondary', 'Enter', isMac)).toBe('Control-Shift-Alt-Enter');
    expect(mod('Access', 'Enter', isMac)).toBe('Shift-Alt-Enter');
    expect(mod('Ctrl', 'Enter', isMac)).toBe('Control-Enter');
    expect(mod('Alt', 'Enter', isMac)).toBe('Alt-Enter');
    expect(mod('CtrlShift', 'Enter', isMac)).toBe('Control-Shift-Enter');
    expect(mod('Shift', 'Enter', isMac)).toBe('Shift-Enter');
    expect(mod('ShiftAlt', 'Enter', isMac)).toBe('Shift-Alt-Enter');
  });

  it('should run on Mac', () => {
    const isMac = () => true;
    expect(mod('Primary', 'Enter', isMac)).toBe('Meta-Enter');
    expect(mod('PrimaryShift', 'Enter', isMac)).toBe('Shift-Meta-Enter');
    expect(mod('PrimaryAlt', 'Enter', isMac)).toBe('Alt-Meta-Enter');
    expect(mod('Secondary', 'Enter', isMac)).toBe('Shift-Alt-Meta-Enter');
    expect(mod('Access', 'Enter', isMac)).toBe('Control-Alt-Enter');
    expect(mod('Ctrl', 'Enter', isMac)).toBe('Control-Enter');
    expect(mod('Alt', 'Enter', isMac)).toBe('Alt-Enter');
    expect(mod('CtrlShift', 'Enter', isMac)).toBe('Control-Shift-Enter');
    expect(mod('Shift', 'Enter', isMac)).toBe('Shift-Enter');
    expect(mod('ShiftAlt', 'Enter', isMac)).toBe('Shift-Alt-Enter');
  });
});
