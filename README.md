# react-usedatum

```
Datum: "a single piece of information, as a fact, statistic, or code; an item of data".
```

This package provides a wrapper for a value which can be accessed from either a
React component or from a regular js/ts environment.

Setting the data value from a non react environment will trigger react component
updates for any components that have an active useDatum instance.

An onChange event callback is available to handle side
effects that may be needed like persistence or background actions.

## Example - Share a value between multiple components

```ts
const [useRunning] = UseDatum(false);

const MyComponent1 = () => {
    const [running, setRunning] = useRunning();
    ...
}

const MyComponent2 = () => {
    const [running, setRunning] = useRunning();
    ...
}
```

## Example - A value that is settable from any context

```ts
const [useRunning, setRunning, getRunning] = UseDatum(false);

setTimeout(() => {
    console.log(`Running = ${getRunning()}`);
    setRunning(true);
}, 6000);

const MyComponent = () => {
    const [running, setRunning] = useRunning();
    ...
}
```

## Installation

```
yarn add react-usedatum
```

or

```
npm -i react-usedatum --save
```
