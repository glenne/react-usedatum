// Copyright (c) 2020 Glenn R. Engel
// SPDX-License-Identifier: ISC
// https://opensource.org/licenses/ISC
import { useReducer, useEffect } from 'react'
import deepequal from 'fast-deep-equal/es6/react'

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
 * @return [ useDatum, setDatum, getDatum ]
 *  useDatum - A traditional useState hook equivalent.
 *  setDatum - A function which can be used to set the value from any context.
 *  getDatum - A function to query the value from any context.
 */
export function UseDatum<T>(
  initialValue: T,
  onChange?: (prev: T, next: T) => void
) {
  const callbacks: {
    [key: string]: () => void
  } = {}
  const state = {
    value: initialValue,
    subscriberCount: 0,
  }

  const isObject = (val: any) => {
    return (
      val != null && typeof val === 'object' && Array.isArray(val) === false
    )
  }

  /**
   * @brief Get the current value.
   * @return The current value.
   */
  const getDatum = () => state.value

  /**
   * @brief Update datum with a new value.
   * @param newValue The new value to apply.
   * @param force If true, skip equality checks as force an update.
   */
  const setDatum = (newValue: T, force = false) => {
    let changed = force || newValue !== state.value
    if (!changed && isObject(newValue)) {
      // compare object contents for equality
      changed = !deepequal(newValue, state.value)
    }
    if (changed) {
      const prior = state.value
      state.value = newValue
      if (onChange) {
        onChange(prior, newValue)
      }
      for (const key in callbacks) {
        callbacks[key]()
      }
    }
  }

  /**
   * @brief Returns a stateful value, and a function to update it.
   */
  const useDatum = () => {
    const [, forceRender] = useReducer((s) => s + 1, 0)

    useEffect(() => {
      const id = String(state.subscriberCount++)
      callbacks[id] = forceRender
      return () => {
        delete callbacks[id]
      }
    }, [forceRender])

    // The useState equivalent
    return [state.value, setDatum] as [T, typeof setDatum]
  }

  // Global context helpers
  return [useDatum, setDatum, getDatum] as [
    typeof useDatum,
    typeof setDatum,
    typeof getDatum
  ]
}
export default UseDatum
