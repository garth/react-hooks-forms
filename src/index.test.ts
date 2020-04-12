import { renderHook, act } from '@testing-library/react-hooks'
import { ChangeEvent, FormEvent } from 'react'
import isEmail from 'validator/lib/isEmail'
import { useForm, defineForm } from '.'

const formDefinition = defineForm({
  username: { value: '', isValid: isEmail },
  password: { value: '', isValid: (value) => value.length > 0 },
})

test('Form is initially invalid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.isValid).toBe(false)
})

test('Invalid field content not valid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.username.isValid).toBe(false)
  act(() =>
    result.current.form.username.onChange({ currentTarget: { value: 'test@email#com' } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  expect(result.current.form.username.isValid).toBe(false)
})

test('Valid field content is valid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.username.isValid).toBe(false)
  act(() =>
    result.current.form.username.onChange({ currentTarget: { value: 'test@email.com' } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  expect(result.current.form.username.isValid).toBe(true)
})

test('Form is valid when all fields are valid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.isValid).toBe(false)
  act(() =>
    result.current.form.username.onChange({ currentTarget: { value: 'test@email.com' } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  expect(result.current.form.isValid).toBe(false)
  act(() =>
    result.current.form.password.onChange({ currentTarget: { value: 'secret' } } as ChangeEvent<HTMLInputElement>)
  )
  expect(result.current.form.isValid).toBe(true)
})

test('Untouch fields are pristine', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.password.isPristine).toBe(true)
})

test('Touched fields are not pristine', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.password.isPristine).toBe(true)
  act(() =>
    result.current.form.password.onChange({ currentTarget: { value: 'secret' } } as ChangeEvent<HTMLInputElement>)
  )
  expect(result.current.form.password.isPristine).toBe(false)
})

test("Don't flag errors on pristine fields", () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.username.isValid).toBe(false)
  expect(result.current.form.username.flagError).toBe(false)
})

test('Flag errors on dirty fields', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.form.username.onChange({ currentTarget: { value: 'test@email#com' } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  expect(result.current.form.username.isValid).toBe(false)
  expect(result.current.form.username.flagError).toBe(true)
})

test('OnSubmit is not called for invalid forms', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.onSubmit((json) =>
      expect(json).toEqual({
        username: '',
        password: '',
      })
    )({ preventDefault() {} } as FormEvent<HTMLFormElement>)
  )
  expect.assertions(0)
})

test('Is Pristine is false after failed submit', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.form.username.isPristine).toBe(true)
  expect(result.current.form.password.isPristine).toBe(true)
  act(() => result.current.onSubmit(() => {})({ preventDefault() {} } as FormEvent<HTMLFormElement>))
  expect(result.current.form.username.isPristine).toBe(false)
  expect(result.current.form.password.isPristine).toBe(false)
})

test('OnSubmit receives form json', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.form.username.onChange({ currentTarget: { value: 'test@email.com' } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  act(() =>
    result.current.form.password.onChange({ currentTarget: { value: 'secret' } } as ChangeEvent<HTMLInputElement>)
  )
  result.current.onSubmit((json) =>
    expect(json).toEqual({
      username: 'test@email.com',
      password: 'secret',
    })
  )({ preventDefault() {} } as FormEvent<HTMLFormElement>)
  expect.assertions(1)
})

test('Reset values', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.reset({
      username: 'test@email.com',
      password: 'secret',
    })
  )
  result.current.onSubmit((json) =>
    expect(json).toEqual({
      username: 'test@email.com',
      password: 'secret',
    })
  )({ preventDefault() {} } as FormEvent<HTMLFormElement>)
  expect.assertions(1)
})
