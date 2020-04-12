# react-hooks-forms

A react hooks approach to forms with full test coverage.

## Install

```
yarn add react-hooks-forms
```

or

```
npm install react-hooks-forms
```

## Usage Example

```tsx
import React from 'react'
import isEmail from 'validator/lib/isEmail'
import { useForm, defineForm } from 'react-hooks-forms'

const formDefinition = defineForm({
  username: { value: '', isValid: isEmail },
  password: { value: '', isValid: value => value.length > 0 }
})

const Login: React.StatelessComponent = () => {
  const { form, reset, onSubmit } = useForm(formDefinition)

  return (
    <form
      onSubmit={onSubmit(json => {
        console.log(json)
        reset()
      }}>
      <h1>Sign In</h1>

      <label>Username</label>
      <input
        value={form.username.value}
        className={form.username.flagError ? 'error' : ''}
        onChange={form.username.onChange}
      />

      <label>Password</label>
      <input
        type="password"
        value={form.password.value}
        className={!form.password.flagError ? 'error' : ''}
        onChange={form.password.onChange)}
      />

      <button type="submit">
        Sign In
      </button>
    </form>
  )
}

export default Login
```
