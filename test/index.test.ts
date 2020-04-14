import { renderHook, act } from '@testing-library/react-hooks'
import { ChangeEvent, FormEvent } from 'react'
import isEmail from 'validator/lib/isEmail'
import { useForm, defineForm } from '../src'

const formDefinition = defineForm({
  username: { value: '', isValid: (value) => isEmail(value) },
  password: { value: '', isValid: (value) => value.length > 0 },
  rememberMe: { value: false as boolean },
})

test('String values are set from currentTarget.value', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.fields.username.onChange({ currentTarget: { value: 'test@email.com' } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  expect(result.current.fields.username.value).toBe('test@email.com')
})

test('Boolean values are set from currentTarget.checked', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.fields.rememberMe.onChange({ currentTarget: { type: 'checkbox', checked: true } } as ChangeEvent<
      HTMLInputElement
    >)
  )
  expect(result.current.fields.rememberMe.value).toBe(true)
})

test('Radio inputs should set their value', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.fields.username.onChange({
      currentTarget: { type: 'radio', checked: true, value: 'test' },
    } as ChangeEvent<HTMLInputElement>)
  )
  expect(result.current.fields.username.value).toBe('test')
})

test('Unchecked radio inputs should not change state', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.fields.rememberMe.onChange({
      currentTarget: { type: 'radio', checked: false, value: 'test' },
    } as ChangeEvent<HTMLInputElement>)
  )
  expect(result.current.fields.username.value).toBe('')
})

test('Form is initially invalid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.isValid).toBe(false)
})

test('Invalid field content not valid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.fields.username.isValid).toBe(false)
  act(() => result.current.fields.username.setValue('test@email#com'))
  expect(result.current.fields.username.isValid).toBe(false)
})

test('Valid field content is valid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.fields.username.isValid).toBe(false)
  act(() => result.current.fields.username.setValue('test@email.com'))
  expect(result.current.fields.username.isValid).toBe(true)
})

test('Form is valid when all fields are valid', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.isValid).toBe(false)
  act(() => result.current.fields.username.setValue('test@email.com'))
  expect(result.current.isValid).toBe(false)
  act(() => result.current.fields.password.setValue('secret'))
  expect(result.current.isValid).toBe(true)
})

test('Untouch fields are pristine', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.fields.password.isPristine).toBe(true)
})

test('Touched fields are not pristine', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.fields.password.isPristine).toBe(true)
  act(() => result.current.fields.password.setValue('secret'))
  expect(result.current.fields.password.isPristine).toBe(false)
})

test("Don't flag errors on pristine fields", () => {
  const { result } = renderHook(() => useForm(formDefinition))
  expect(result.current.fields.username.isValid).toBe(false)
  expect(result.current.fields.username.flagError).toBe(false)
})

test('Flag errors on dirty fields', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() => result.current.fields.username.setValue('test@email#com'))
  expect(result.current.fields.username.isValid).toBe(false)
  expect(result.current.fields.username.flagError).toBe(true)
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
  expect(result.current.fields.username.isPristine).toBe(true)
  expect(result.current.fields.password.isPristine).toBe(true)
  act(() => result.current.onSubmit(() => {})({ preventDefault() {} } as FormEvent<HTMLFormElement>))
  expect(result.current.fields.username.isPristine).toBe(false)
  expect(result.current.fields.password.isPristine).toBe(false)
})

test('OnSubmit receives form json', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() => result.current.fields.username.setValue('test@email.com'))
  act(() => result.current.fields.password.setValue('secret'))
  act(() =>
    result.current.onSubmit((json) =>
      expect(json).toEqual({
        username: 'test@email.com',
        password: 'secret',
        rememberMe: false,
      })
    )({ preventDefault() {} } as FormEvent<HTMLFormElement>)
  )
  expect.assertions(1)
})

test('Reset values to original', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() => result.current.fields.username.setValue('test@email.com'))
  expect(result.current.fields.username.isPristine).toBe(false)
  expect(result.current.fields.username.value).toBe('test@email.com')
  act(() => result.current.reset())
  expect(result.current.fields.username.isPristine).toBe(true)
  expect(result.current.fields.username.value).toBe('')
})

test('Reset values to new', () => {
  const { result } = renderHook(() => useForm(formDefinition))
  act(() =>
    result.current.reset({
      username: 'test@email.com',
      password: 'secret',
      rememberMe: true,
    })
  )
  expect(result.current.fields.username.value).toBe('test@email.com')
  expect(result.current.fields.password.value).toBe('secret')
  expect(result.current.fields.rememberMe.value).toBe(true)
})
