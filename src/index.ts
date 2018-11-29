import { useState } from 'react'

export interface FormField {
  value: string
  isPristine: boolean
  isValid: boolean
}
export type IsValid = (value: string, form?: FormDefinition) => boolean
export interface FormDefinition {
  [fieldName: string]: {
    value?: string
    isValid?: IsValid
  }
}
export type FormFields<T extends FormDefinition> = { [F in keyof T]: FormField }
export type Form<T extends FormDefinition> = { isValid: boolean } & FormFields<T>
export type SetField = (name: string, value: string) => void
export type Reset = () => void

const validateForm = <T extends FormDefinition>(formDefinition: T): Form<T> =>
  Object.keys(formDefinition).reduce<Form<T>>(
    (form, fieldName) => {
      const field = formDefinition[fieldName]
      const value = field.value || ''
      const isValid = typeof field.isValid === 'function' ? field.isValid(value, formDefinition) : true
      form[fieldName] = {
        value,
        isPristine: field['isPristine'] === undefined ? true : field['isPristine'],
        isValid
      }
      form.isValid = form.isValid && isValid
      return form
    },
    { isValid: true } as any
  )

export const useForm = <T extends FormDefinition>(formDefinition: T): [Form<T>, SetField, Reset] => {
  const [originalForm] = useState(formDefinition)
  const [form, setForm] = useState(formDefinition)

  const setField = (name, value) => {
    setForm({
      ...(form as any),
      [name]: {
        ...form[name],
        value,
        isPristine: false
      }
    })
  }

  const reset = () => {
    setForm(originalForm)
  }

  return [validateForm(form), setField, reset]
}
