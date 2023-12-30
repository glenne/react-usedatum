// Copyright (c) 2020-2023 Glenn R. Engel
// SPDX-License-Identifier: ISC
// https://opensource.org/licenses/ISC
import { useReducer, useEffect, useRef } from 'react';
import deepequal from 'fast-deep-equal/es6/react';

/**
 * Provide a wrapper for a value which can be accessed from either a
 * React component or from a regular js/ts environment. Setting the
 * value from a non react environment will trigger react component
 * updates.  An onChange event callback is available to handle side
 * effects that may be needed like persistence or background actions.
 *
 * Example - Share a value between multiple components
 * ```ts
 * const [useRunning] = UseDatum(false);
 *
 * const MyComponent = () => {
 *     const [running, setRunning] = useRunning();
 *     ...
 * }
 * ```
 *
 * Example - A value that is settable from any context
 * ```ts
 * const [useRunning, setRunning, getRunning] = UseDatum(false);
 *
 * setTimeout(() => {
 *     console.log(`Running = ${getRunning()}`);
 *     setRunning(true);
 * }, 6000);
 *
 * const MyComponent = () => {
 *     const [running, setRunning] = useRunning();
 *     ...
 * }
 * ```
 *
 * @param initialValue The initial value.
 * @param onChange An optional function called if the value changes.
 * @param opts Optional configuration of UseDatum behavior.  Set shallow:true for shallow compare.
 * @return [ useDatum, setDatum, getDatum ]
 *  useDatum - A traditional useState hook equivalent.
 *  setDatum - A function which can be used to set the value from any context.
 *  getDatum - A function to query the value from any context.
 */
export function UseDatum<T>(
  initialValue: T,
  onChange?: (current: T, prior: T) => void,
  opts?: { shallow?: boolean; trace?: string }
) {
  const callbacks: {
    [key: string]: () => void;
  } = {};
  const state = {
    value: initialValue,
    subscriberCount: 0,
    changeCount: 0,
    shallow: opts && opts.shallow ? Boolean(opts.shallow) : false,
  };
  const trace = opts && opts.trace;

  if (trace) {
    console.log(`UseDatum: Creating for ${trace}`);
  }

  const isObject = (val: any) => {
    return val != null && typeof val === 'object';
  };

  /**
   * @brief Get the current value.
   * @return The current value.
   */
  const getDatum = () => state.value;

  /**
   * @brief Update datum with a new value.
   * @param newValue The new value to apply.
   * @param force If true, skip equality checks and force an update.
   */
  const setDatum = (
    newValueOrFunction: T | ((prevState: T) => T),
    force = false
  ) => {
    const newValue =
      typeof newValueOrFunction === 'function'
        ? newValueOrFunction(state.value)
        : newValueOrFunction;

    let changed = force;
    if (!changed) {
      if (state.shallow || !isObject(newValue)) {
        changed = newValue !== state.value;
      } else {
        // compare object contents for equality
        changed = !deepequal(newValue, state.value);
      }
    }
    if (trace) {
      console.log(
        `UseDatum: Setting ${trace}=${newValue} changed=${changed} #callbacks=${
          Object.keys(callbacks).length
        }`
      );
    }
    if (changed) {
      state.changeCount++;
      const prior = state.value;
      state.value = newValue;
      if (onChange) {
        onChange(newValue, prior);
      }
      for (const key in callbacks) {
        callbacks[key]();
      }
    }
  };

  /**
   * @brief Returns a stateful value, and a function to update it.
   */
  const useDatum = () => {
    const [, forceRender] = useReducer((s) => s + 1, 0);
    const context = useRef({
      forceRender,
      id: String(state.subscriberCount++),
      changeCount: state.changeCount,
    });
    useEffect(() => {
      const id = context.current.id;
      callbacks[id] = forceRender;
      if (trace) {
        console.log(
          `UseDatum: Added callback for ${trace} ${id} #callbacks=${
            Object.keys(callbacks).length
          }`
        );
      }

      if (state.changeCount > context.current.changeCount) {
        // this happens if a value change occurs before useEffect is called
        if (trace) {
          console.log(
            `UseDatum: Immediate change detected for ${trace} ${id} #callbacks=${
              Object.keys(callbacks).length
            }`
          );
        }
        context.current.forceRender();
      }

      return () => {
        delete callbacks[id];
        if (trace) {
          console.log(
            `UseDatum: Deleted callback for ${trace} ${id} #callbacks=${
              Object.keys(callbacks).length
            }`
          );
        }
      };
    }, []);

    // The useState equivalent
    return [state.value, setDatum] as [T, typeof setDatum];
  };

  // Global context helpers
  return [useDatum, setDatum, getDatum] as [
    typeof useDatum,
    typeof setDatum,
    typeof getDatum
  ];
}
export default UseDatum;
