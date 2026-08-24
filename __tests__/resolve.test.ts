/**
 * Unit tests for search-directory and component-name resolution, src/resolve.ts.
 */
import { jest } from '@jest/globals';
import { resolve as resolvePath } from 'node:path';
import * as core from '../__fixtures__/core.js';

// Mock logging before importing the module under test.
jest.unstable_mockModule('@actions/core', () => core);

const { resolveAbsoluteSearchDirectories, resolveActualComponentNames } =
  await import('../src/resolve.js');

describe('resolveAbsoluteSearchDirectories', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns an empty list when no directories are supplied', () => {
    expect(resolveAbsoluteSearchDirectories([])).toEqual([]);
  });

  it('resolves relative directories and preserves absolute directories', () => {
    const absoluteDirectory = resolvePath(process.cwd(), 'absolute');

    expect(
      resolveAbsoluteSearchDirectories(['src', absoluteDirectory]),
    ).toEqual([resolvePath(process.cwd(), 'src'), absoluteDirectory]);
  });
});

describe('resolveActualComponentNames', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('adds the latest version when a component has no version', () => {
    expect(resolveActualComponentNames(['component_name'])).toEqual([
      'component_name:latest',
    ]);
    expect(core.debug).toHaveBeenCalledWith(
      'Component: component_name, Version: latest',
    );
  });

  it('preserves an explicitly supplied component version', () => {
    expect(resolveActualComponentNames(['component-name:1.2.3'])).toEqual([
      'component-name:1.2.3',
    ]);
    expect(core.debug).toHaveBeenCalledWith(
      'Component: component-name, Version: 1.2.3',
    );
  });

  it('skips invalid component names and reports a warning', () => {
    expect(resolveActualComponentNames(['invalid component', 'valid'])).toEqual(
      ['valid:latest'],
    );
    expect(core.warning).toHaveBeenCalledWith(
      'Invalid component name: invalid component',
    );
  });
});
