/**
 * Unit tests for the action's main orchestration, src/main.ts.
 */
import { jest } from '@jest/globals';
import { resolve } from 'node:path';
import * as core from '../__fixtures__/core.js';

const recursiveSearchForComponents = jest.fn();
const resolveAbsoluteSearchDirectories = jest.fn();
const resolveActualComponentNames = jest.fn();

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core);
jest.unstable_mockModule('../src/search.js', () => ({
  recursiveSearchForComponents,
}));
jest.unstable_mockModule('../src/resolve.js', () => ({
  resolveAbsoluteSearchDirectories,
  resolveActualComponentNames,
}));

const { run } = await import('../src/main.js');

describe('main.ts', () => {
  beforeEach(() => {
    core.getInput.mockImplementation((name) =>
      name === 'components' ? 'alpha:1.2.3, beta' : 'src, /tmp/components',
    );
    resolveActualComponentNames.mockReturnValue(['alpha:1.2.3', 'beta:latest']);
    resolveAbsoluteSearchDirectories.mockReturnValue([
      resolve(process.cwd(), 'src'),
      '/tmp/components',
    ]);
    recursiveSearchForComponents.mockReturnValue({
      'alpha:1.2.3': '/tmp/alpha/.component.yml',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('parses inputs, searches resolved directories, and sets the component output', async () => {
    await run();

    expect(resolveActualComponentNames).toHaveBeenCalledWith([
      'alpha:1.2.3',
      'beta',
    ]);
    expect(resolveAbsoluteSearchDirectories).toHaveBeenCalledWith([
      'src',
      '/tmp/components',
    ]);
    expect(recursiveSearchForComponents).toHaveBeenCalledWith(
      ['alpha:1.2.3', 'beta:latest'],
      resolve(process.cwd(), 'src'),
    );
    expect(recursiveSearchForComponents).toHaveBeenCalledWith(
      ['alpha:1.2.3', 'beta:latest'],
      '/tmp/components',
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      'components',
      JSON.stringify({ 'alpha:1.2.3': '/tmp/alpha/.component.yml' }),
    );
    expect(core.info).toHaveBeenCalledWith(
      'Finding components: alpha:1.2.3, beta in directories: src, /tmp/components',
    );
    expect(core.warning).toHaveBeenCalledWith('Component beta not found');
  });

  it('searches the current directory when no directory input is supplied', async () => {
    core.getInput.mockImplementation((name) =>
      name === 'components' ? '' : '',
    );
    resolveActualComponentNames.mockReturnValue([]);
    resolveAbsoluteSearchDirectories.mockReturnValue([]);
    recursiveSearchForComponents.mockReturnValue({});

    await run();

    expect(recursiveSearchForComponents).toHaveBeenCalledWith(
      [],
      process.cwd(),
    );
    expect(core.setOutput).toHaveBeenCalledWith('components', '{}');
  });

  it('reports an Error thrown while resolving inputs as a failed action', async () => {
    resolveActualComponentNames.mockImplementation(() => {
      throw new Error('invalid input');
    });

    await expect(run()).resolves.toBeUndefined();

    expect(core.setFailed).toHaveBeenCalledWith('invalid input');
    expect(core.setOutput).not.toHaveBeenCalled();
  });
});
