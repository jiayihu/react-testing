import { useMemo } from 'react';
import { usePrevious } from './usePrevious';

const compareInputs = (
  inputKeys: string[],
  oldInputs: Record<string, unknown>,
  newInputs: Record<string, unknown>,
) => {
  inputKeys.forEach((key) => {
    const oldInput = oldInputs[key];
    const newInput = newInputs[key];
    if (oldInput !== newInput) {
      // eslint-disable-next-line no-console
      console.log('change detected', key, 'old:', oldInput, 'new:', newInput);
    }
  });
};

/**
 * Debug which hook dependencies have changed wrt the previous render
 *
 * @example
 *
 * ```ts
 * useDependenciesDebugger({ dep1, dep2, dep3 })
 * ```
 */
export const useDependenciesDebugger = (inputs: Record<string, unknown>): void => {
  const oldInputs = usePrevious(inputs);
  const inputValuesArray = Object.values(inputs);
  const inputKeysArray = Object.keys(inputs);

  useMemo(() => {
    compareInputs(inputKeysArray, oldInputs, inputs);
  }, inputValuesArray); // eslint-disable-line react-hooks/exhaustive-deps
};
