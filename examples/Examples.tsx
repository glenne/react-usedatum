import { UseDatum } from '../src/UseDatum';

//**********************************************************************
//Example - Share a value between multiple components
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

//**********************************************************************
//Example - A value that is settable from any context

const [useRunning, setRunning, getRunning] = UseDatum(false);

setTimeout(() => {
  console.log(`Running = ${getRunning()}`);
  setRunning(true);
}, 6000);

const MyComponent3 = () => {
  const [running, setRunning] = useRunning();
  /* ... */
};

//**********************************************************************
//Example - Triggering updates on changes
const [useFullName, setFullName] = UseDatum('Josie Samuel');

// Update the composite name when First or Last changes
const [useLast, setLast, getLast] = UseDatum('Samuel', (last): void =>
  setFullName(`${getFirst()} ${last}`)
);
const [useFirst, setFirst, getFirst] = UseDatum('Josie', (first): void =>
  setFullName(`${first} ${getLast()}`)
);

//**********************************************************************
//Example - Forcing an update

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
