import { useState, FormEvent, ChangeEvent } from 'react'

type FieldType = string | boolean

export type FormJson = { [name: string]: FieldType }

export interface FieldState<TField = FieldType> {
  value: TField
  isPristine: boolean
}

export interface DerivedFieldState {
  isValid: boolean
  flagError: boolean
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export type FieldValidator<TField extends FieldType, TForm extends FormJson> = (
  value: TField,
  form?: FormState<TForm>
) => boolean

export interface FieldDefinition<TField extends FieldType, TForm extends FormJson> {
  value: TField
  isValid?: FieldValidator<TField, TForm>
}

export type FormDefinition<TForm extends FormJson> = {
  [F in keyof TForm]: FieldDefinition<TForm[F], TForm>
}

export type FormState<TForm extends FormJson> = { [F in keyof TForm]: FieldState<TForm[F]> }

export type DerivedFormState<TForm extends FormJson> = { isValid: boolean } & {
  [F in keyof TForm]: FieldState<TForm[F]> & DerivedFieldState
}

export type Reset<TForm extends FormJson> = (formJson?: TForm) => void

export type OnSubmit<TForm extends FormJson> = (
  submitHandler: (formJson: TForm) => void
) => (e: FormEvent<HTMLFormElement>) => void

const validateForm = <TForm extends FormJson>(
  formDefinition: FormDefinition<TForm>,
  formState: FormState<TForm>,
  setField: (name: string, value: FieldType) => void
): DerivedFormState<TForm> => {
  const form: Record<string, DerivedFieldState | boolean> = { isValid: true }
  Object.keys(formDefinition).forEach((fieldName) => {
    const definition = formDefinition[fieldName]
    const state = formState[fieldName]
    const isValid = typeof definition.isValid === 'function' ? definition.isValid(state.value, { ...formState }) : true
    const isPristine = state.isPristine
    form[fieldName] = {
      ...state,
      isValid,
      flagError: !isPristine && !isValid,
      onChange: (event) => {
        if (event.currentTarget.type === 'radio' && !event.currentTarget['checked']) {
          return
        }

        setField(
          fieldName,
          event.currentTarget.type === 'checkbox' ? event.currentTarget['checked'] : event.currentTarget.value
        )
      },
    }
    form.isValid = form.isValid && isValid
  })
  return form as DerivedFormState<TForm>
}

const formStateFromDefinition = <TForm extends FormJson>(formDefinition: FormDefinition<TForm>) => {
  const form: Record<string, FieldState> = {}
  Object.keys(formDefinition).forEach((fieldName) => {
    form[fieldName] = {
      value: formDefinition[fieldName].value,
      isPristine: true,
    }
  })
  return form as FormState<TForm>
}

const formStateFromJson = <TForm extends FormJson>(formJson: TForm) => {
  const form: Record<string, FieldState> = {}
  Object.keys(formJson).forEach((fieldName) => {
    form[fieldName] = {
      value: formJson[fieldName],
      isPristine: true,
    }
  })
  return form as FormState<TForm>
}

export const useForm = <TForm extends FormJson>(
  formDefinition: FormDefinition<TForm>
): {
  form: DerivedFormState<TForm>
  reset: Reset<TForm>
  onSubmit: OnSubmit<TForm>
  formToJson: (form: FormState<TForm>) => TForm
} => {
  const [form, setForm] = useState<FormState<TForm>>(() => formStateFromDefinition(formDefinition))

  const setField = (name: keyof TForm, value: FieldType) => {
    setForm({
      ...form,
      [name]: {
        ...form[name],
        value,
        isPristine: false,
      },
    })
  }

  const reset = (formJson?: TForm) => {
    if (formJson) {
      setForm(formStateFromJson(formJson))
    } else {
      setForm(formStateFromDefinition(formDefinition))
    }
  }

  const formToJson = (): TForm => {
    const json: Record<string, FieldType> = {}
    Object.keys(form).forEach((field) => {
      json[field] = form[field].value
    })
    return json as TForm
  }

  const derivedForm = validateForm(formDefinition, form, setField)

  const clearPristine = () => {
    if (!derivedForm.isValid) {
      const dirtyForm: Record<string, FieldState> = {}
      Object.keys(form).forEach((fieldName) => {
        dirtyForm[fieldName] = {
          ...form[fieldName],
          isPristine: false,
        }
      })
      setForm(dirtyForm as FormState<TForm>)
    }
  }

  const onSubmit: OnSubmit<TForm> = (submitHandler) => (e) => {
    e.preventDefault()
    clearPristine()
    if (derivedForm.isValid) {
      submitHandler(formToJson())
    }
  }

  return {
    form: derivedForm,
    reset,
    onSubmit,
    formToJson,
  }
}
