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
export type SetField<T extends FormDefinition> = (name: keyof T, value: string) => void
export type Reset<T extends FormDefinition> = (formDefinition?: FormJson<T>) => void
export type FormJson<T extends FormDefinition> = { [F in keyof T]: string }

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

export const useForm = <T extends FormDefinition>(
  formDefinition: T,
  formValues?: FormJson<T>
): {
  form: Form<T>
  setField: SetField<T>
  reset: Reset<T>
  formToJson: (form: Form<T>) => FormJson<T>
} => {
  const setFormValues = (formDefinition: T, formValues?: FormJson<T>) =>
    Object.keys(formDefinition).reduce(
      (form, field) => {
        form[field] = {
          ...formDefinition[name],
          value: (formValues && formValues[name]) || formDefinition[name].value || ''
        }
        return form
      },
      {} as T
    )

  const [originalFormDefinition] = useState(formDefinition)
  const [originalFormValues] = useState(formValues)
  const [form, setForm] = useState(() => setFormValues(formDefinition))

  const setField = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: {
        ...form[name],
        value,
        isPristine: false
      }
    })
  }

  const reset = (formValues?: FormJson<T>) => {
    setForm(setFormValues(originalFormDefinition, formValues || originalFormValues))
  }

  const formToJson = (form: Form<T>): FormJson<T> =>
    Object.keys(form).reduce(
      (json, field) => {
        json[field] = form[field].value
        return json
      },
      {} as FormJson<T>
    )

  return {
    form: validateForm(form),
    setField,
    reset,
    formToJson
  }
}
