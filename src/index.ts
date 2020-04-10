import { useState, FormEvent, ChangeEvent } from 'react'

export interface FormField {
  value: string
  isPristine: boolean
  isValid: boolean
  flagError: boolean
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}
export type IsValid = (value: string, form?: FormDefinition) => boolean
export interface FormFieldValidate {
  value?: string
  isValid?: IsValid
  isPristine?: boolean
}
export interface FormDefinition {
  [fieldName: string]: FormFieldValidate
}
export type FormFields<T extends FormDefinition> = { [F in keyof T]: FormField }
export type Form<T extends FormDefinition> = { isValid: boolean } & FormFields<T>
export type SetField<T extends FormDefinition> = (name: keyof T, value: string) => void
export type Reset<T extends FormDefinition> = (formDefinition?: FormJson<T>) => void
export type FormJson<T extends FormDefinition> = { [F in keyof T]: string }
export type OnSubmit<T extends FormDefinition> = (
  submitHandler: (json: FormJson<T>) => void
) => (e: FormEvent<HTMLFormElement>) => void

export const defineForm: <T extends FormDefinition>(formDefinition: T) => T = (formDefinition) => formDefinition

const validateForm = <T extends FormDefinition>(
  formDefinition: T,
  setField: (name: keyof T, value: string) => void
): Form<T> => {
  const form: Record<string, FormField | boolean> = { isValid: true }
  Object.keys(formDefinition).forEach((fieldName) => {
    const field = formDefinition[fieldName]
    const value = field.value
    const isValid = typeof field.isValid === 'function' ? field.isValid(value, formDefinition) : true
    const isPristine = field.isPristine === undefined ? true : field.isPristine
    form[fieldName] = {
      value,
      isPristine,
      isValid,
      flagError: !isPristine && !isValid,
      onChange: (e) => setField(fieldName, e.target.value),
    }
    form.isValid = form.isValid && isValid
  })
  return form as Form<T>
}

const setFormValues = <T extends FormDefinition>(definition: T, values?: FormJson<T>): T => {
  const form: Record<string, FormFieldValidate> = {}
  Object.keys(definition).forEach((field) => {
    form[field] = {
      ...definition[name],
      isPristine: true,
      value: (values && values[name]) || definition[name].value || '',
    }
  })
  return form as T
}

export const useForm = <T extends FormDefinition>(
  formDefinition: T,
  formValues?: FormJson<T>
): {
  form: Form<T>
  setField: SetField<T>
  reset: Reset<T>
  onSubmit: OnSubmit<T>
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

  const formState = validateForm(form, setField)

  const formToJson = (): FormJson<T> => {
    const json: Record<string, string> = {}
    Object.keys(formState).forEach((field) => {
      json[field] = formState[field].value
    })
    return json as FormJson<T>
  }

  const clearPristine = () => {
    if (!formState.isValid) {
      const invalidForm: Record<string, FormFieldValidate> = { ...form }
      Object.keys(form).forEach((fieldName) => {
        if (form[fieldName].isPristine) {
          invalidForm[fieldName] = { ...form[fieldName], isPristine: false }
          return form
        }
      })
    }
  }

  const onSubmit: OnSubmit<T> = (submitHandler) => (e) => {
    e.preventDefault()
    clearPristine()
    if (formState.isValid) {
      submitHandler(formToJson())
    }
  }

  return {
    form: formState,
    setField,
    reset,
    onSubmit,
    formToJson,
  }
}
