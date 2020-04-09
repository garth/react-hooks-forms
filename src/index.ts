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
    isPristine?: boolean
  }
}
export type FormFields<T extends FormDefinition> = { [F in keyof T]: FormField }
export type Form<T extends FormDefinition> = { isValid: boolean } & FormFields<T>
export type SetField<T extends FormDefinition> = (name: keyof T, value: string) => void
export type Reset<T extends FormDefinition> = (formDefinition?: FormJson<T>) => void
export type FormJson<T extends FormDefinition> = { [F in keyof T]: string }

export const defineForm: <T extends FormDefinition>(formDefinition: T) => T = (formDefinition) => formDefinition

const validateForm = <T extends FormDefinition>(formDefinition: T): Form<T> =>
  Object.keys(formDefinition).reduce(
    (form, fieldName) => {
      const field = formDefinition[fieldName]
      const value = field.value
      const isValid = typeof field.isValid === 'function' ? field.isValid(value, formDefinition) : true
      const isPristine = field.isPristine === undefined ? true : field.isPristine
      form[fieldName] = {
        value,
        isPristine,
        isValid,
      }
      form.isValid = form.isValid && isValid
      return form
    },
    { isValid: true } as Form<T>
  )

const setFormValues = <T extends FormDefinition>(definition: T, values?: FormJson<T>): T =>
  Object.keys(definition).reduce((form, field) => {
    form[field] = {
      ...definition[name],
      isPristine: true,
      value: (values && values[name]) || definition[name].value || '',
    }
    return form
  }, {} as T)

export const useForm = <T extends FormDefinition>(
  formDefinition: T,
  formValues?: FormJson<T>
): {
  form: Form<T>
  setField: SetField<T>
  reset: Reset<T>
  formToJson: (form: Form<T>) => FormJson<T>
} => {
  const [originalFormDefinition] = useState(formDefinition)
  const [originalFormValues] = useState(formValues)
  const [form, setForm] = useState(formDefinition)

  const setField = (name: keyof T, value: string) => {
    setForm({
      ...form,
      [name]: {
        ...form[name],
        value,
        isPristine: false,
      },
    })
  }

  const reset = (formValues?: FormJson<T>) => {
    setForm(setFormValues(originalFormDefinition, formValues || originalFormValues))
  }

  const formToJson = (form: Form<T>): FormJson<T> =>
    Object.keys(form).reduce((json, field) => {
      json[field] = form[field].value
      return json
    }, {} as FormJson<T>)

  return {
    form: validateForm(form),
    setField,
    reset,
    formToJson,
  }
}
