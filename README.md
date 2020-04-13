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
import { useForm, FormDefinition } from 'react-hooks-forms'

const formDefinition: FormDefinition<{
  username: string
  password: string
  rememberMe: boolean
}> = {
  username: { value: '', isValid: (value) => isEmail(value) },
  password: { value: '', isValid: (value) => value.length > 0 },
  rememberMe: { value: false }
}

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

      <label>
        <input
          type="checkbox"
          value={form.rememberMe.value}
          onChange={form.rememberMe.OnChange}
        />
        remember me?
      </label>

      <button type="submit">
        Sign In
      </button>
    </form>
  )
}

export default Login
```
