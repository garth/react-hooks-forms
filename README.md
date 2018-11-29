# react-hooks-forms

A react hooks approach to forms.

> Disclaimer: To use hooks a pre-release version of react 16.7 is required. Since the hooks API is subject to change, this library may or may not work with future versions of react.

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
import { isEmail } from 'validator'
import { useForm } from 'react-hooks-forms'

const formDefinition = {
  username: { value: '', isValid: isEmail },
  password: { value: '', isValid: value => value.length > 0 }
}

const Login: React.StatelessComponent = () => {
  const [form, setField] = useForm(formDefinition)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        console.log(form)
      }}>
      <h1>Sign In</h1>

      <label>Username</label>
      <input
        value={form.username.value}
        className={form.username.isPristine || form.username.isValid ? '' : 'error'}
        onChange={e => setField('username', e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        value={form.password.value}
        className={form.password.isPristine || form.password.isValid ? '' : 'error'}
        onChange={e => setField('password', e.target.value)}
      />

      <button type="submit" disabled={!form.isValid}>
        Sign In
      </button>
    </form>
  )
}

export default Login
```
