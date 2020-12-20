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
import React, { useMemo } from 'react'
import isEmail from 'validator/lib/isEmail'
import { useForm, defineForm } from 'react-hooks-forms'

const Login: React.StatelessComponent = () => {
  const formDefinition = useMemo(() => defineForm({
    username: { value: '', isValid: (value) => isEmail(value) },
    password: { value: '', isValid: (value) => value.length > 0 },
    rememberMe: { value: false as boolean }
  }))
  const form = useForm(formDefinition)

  return (
    <form
      onSubmit={form.onSubmit(json => {
        console.log(json)
        reset()
      }}>
      <h1>Sign In</h1>

      <label>Username</label>
      <input
        value={form.fields.username.value}
        className={form.fields.username.isValidOrPristine ? '' : 'error'}
        onChange={form.fields.username.onChange}
      />

      <label>Password</label>
      <input
        type="password"
        value={form.fields.password.value}
        className={!form.fields.password.isValidOrPristine ? '' : 'error'}
        onChange={form.fields.password.onChange)}
      />

      <label>
        <input
          type="checkbox"
          value={form.fields.rememberMe.value}
          onChange={form.fields.rememberMe.OnChange}
        />
        remember me?
      </label>

      <button type="submit" disabled={form.isValid}>
        Sign In
      </button>
    </form>
  )
}

export default Login
```
