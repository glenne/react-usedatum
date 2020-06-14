# react-usedatum

```txt
Datum: "a single piece of information, as a fact, statistic, or code; an item of data".
```

This package provides a wrapper for values which can be accessed from either a
React component or from a regular js/ts environment. This allows values to be shared between
components easily as well as updating the values from either a component context or global js contexts.

- Simple type-safe sharing of global state
- API similar to useState from withing component
- Simple set/get access from any context
- Rendering updates only fired if the value is changed
- Use of wrapper components and handling of React context is not needed.
- Setting the data value from a non react environment will trigger react component
  updates for any components that have an active useDatum instance.
- An onChange event callback is available to handle side
  effects that may be needed like persistence or background actions.

## Usage

### Declare your state

`export const [useMyState] = UseDatum<MyType>(initialValue);`

or

`export const [useMyState, setMyState] = UseDatum<MyType>(initialValue);`

or

`export const [useMyState, setMyState, getMyState] = UseDatum<MyType>(initialValue);`

### Use in your component

`const [myState, setMyState] = useMyState();`

### Use setter and getter anywhere

`setMyState(newState);`

`getMyState()`

## Example - Share a value between multiple components

```ts
import { UseDatum } from 'react-usedatum';

const [useRunning] = UseDatum(false);
const [useName] = UseDatum('Josie Samuel');

const MyComponent1 = () => {
  const [running, setRunning] = useRunning();
  /* ... */
};

const MyComponent2 = () => {
  const [running, setRunning] = useRunning();
  const [name] = useName();

  const onSomeClick = () => {
    if (name === 'George') {
      setRunning(true);
    }
  };
  /* ... */
};
```

## Example - A value that is settable from any context

The second and third return values from UseDatum provide a setter and getter which can be invoked
from any context. Calling the getter returns the current value while the setter will trigger a
Ui render if any active references to the 'use' return value are active and the value has changed.

```ts
import { UseDatum } from 'react-usedatum';

const [useRunning, setRunning, getRunning] = UseDatum(false);

setTimeout(() => {
  console.log(`Running = ${getRunning()}`);
  setRunning(true);
}, 6000);

const MyComponent3 = () => {
  const [running, setRunning] = useRunning();
  /* ... */
};
```

## Example - Triggering updates on changes

In some cases there is a need to trigger other events when a property is changed. To allow for
this use, the constructor for UseData accepts an onChange callback which is triggered whenever
the value changes. It provides both the previous and the current value as arguments.

```ts
import { UseDatum } from 'react-usedatum';

const [useName] = UseDatum('Josie Samuel', (current, prev) => {
  /* Take action */
});
```

Multiple UseDatum can also be used together to structure or de-structure data.

```ts
import { UseDatum } from 'react-usedatum';

export default UseDatum;
const [useName, setName] = UseDatum('Josie Samuel');

// Update the composite name when First or Last changes using onChange
const [useLast, setLast, getLast] = UseDatum('Samuel', (last): void =>
  setName(`${getFirst()} ${last}`)
);
const [useFirst, setFirst, getFirst] = UseDatum('Josie', (first): void =>
  setName(`${first} ${getLast()}`)
);
```

## Example - Forcing an update

When the encapsulated type is a complex object, Array, or other structure the setValue function
may not detect a change if the value is modified 'in place'.

For example,

```ts
interface Contact {
  first: string;
  last: string;
  phone?: string;
}
const [useContact, setContact] = UseDatum<Contact>({
  first: 'Wilma',
  last: 'Flintstone',
});
const MyComponent4 = () => {
  const [contact, setContact] = useContact();

  // Modifying the object in place does not trigger change updates because and change checks
  // are using the same object for both prior and current values.
  const onFirstSubmit1 = (first: string) => {
    contact.first = first;
    setContact(contact); // Doesn't trigger changes since underlying object changed in place
  };

  // The usual solution is to use object spreading or cloning to create a new object
  const onFirstSubmit2 = (first: string) => {
    const newContact = { ...contact, first };
    setContact(contact); // Works. Changes are triggered
  };

  // If spreading or cloning is expensive, the 'force' option of set can be used
  // to allow an in-place modification to trigger change updates.
  const onFirstSubmit3 = (first: string) => {
    contact.first = first;
    setContact(contact, true); // Works. Changes are triggered with 'force'==true
  };
};
```

## Installation

```bash
yarn add react-usedatum
```

or

```bash
npm -i react-usedatum --save
```

## License

react-usedata uses the [ISC Open Source License](https://opensource.org/licenses/ISC).
