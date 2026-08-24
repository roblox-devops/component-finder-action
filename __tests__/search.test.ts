/**
 * Unit tests for recursive component discovery, src/search.ts.
 */
import { jest } from '@jest/globals';
import { resolve } from 'node:path';
import * as core from '../__fixtures__/core.js';

// Mock logging before importing the module under test.
jest.unstable_mockModule('@actions/core', () => core);

const { recursiveSearchForComponents } = await import('../src/search.js');

const componentsDirectory = resolve(
  process.cwd(),
  '__fixtures__',
  'components',
);

describe('recursiveSearchForComponents', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('finds every component in nested directories', () => {
    expect(recursiveSearchForComponents([], componentsDirectory)).toEqual({
      'alpha:latest': resolve(componentsDirectory, 'alpha', '.component.yml'),
      'beta:latest': resolve(componentsDirectory, 'beta', '.component.yaml'),
      'gamma:latest': resolve(
        componentsDirectory,
        'nested',
        'gamma',
        '.component.yml',
      ),
    });
  });

  it('matches requested component names while preserving requested versions', () => {
    expect(
      recursiveSearchForComponents(
        ['beta:1.0.0', 'missing:latest'],
        componentsDirectory,
      ),
    ).toEqual({
      'beta:1.0.0': resolve(componentsDirectory, 'beta', '.component.yaml'),
    });
  });

  it('skips component files without a component field', () => {
    const result = recursiveSearchForComponents([], componentsDirectory);

    expect(result).not.toHaveProperty('ignored:latest');
  });

  it('warns and returns an empty map for a missing directory', () => {
    const missingDirectory = resolve(componentsDirectory, 'missing');

    expect(recursiveSearchForComponents([], missingDirectory)).toEqual({});
    expect(core.warning).toHaveBeenCalledWith(
      `Directory ${missingDirectory} does not exist`,
    );
  });
});
