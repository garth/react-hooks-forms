import { useState, FormEvent, ChangeEvent } from 'react'

type FieldType = string | boolean

export interface FieldState<TField = FieldType> {
  value: TField
  isPristine: boolean
}

export interface DerivedFieldState<TField = FieldType> {
  isValid: boolean
  flagError: boolean
  setValue: (value: TField) => void
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export type FieldValidator<TField, TForm> = (value: TField, form?: TForm) => boolean

export interface FieldDefinition<TField, TForm> {
  value: TField
  isValid?: FieldValidator<TField, TForm>
}

export type formFieldBase<TField extends FieldType> = { value: TField; isValid?: FieldValidator<TField, FormBase> }

export type FormBase = { [name: string]: formFieldBase<string> | formFieldBase<boolean> }

export type FormDefinition<TForm extends { [name: string]: { value: FieldType } }> = {
  [F in keyof TForm]: FieldDefinition<TForm[F]['value'], TForm>
}

export type FormJson<TForm extends FormBase> = { [F in keyof TForm]: TForm[F]['value'] }

export type FormState<TForm extends FormBase> = {
  [F in keyof TForm]: FieldState<TForm[F]['value']>
}

export type DerivedFormState<TForm extends FormBase> = { isValid: boolean } & {
  [F in keyof TForm]: FieldState<TForm[F]['value']> & DerivedFieldState<TForm[F]['value']>
}

export type Reset<TForm extends FormBase> = (formJson?: FormJson<TForm>) => void

export type OnSubmit<TForm extends FormBase> = (
  submitHandler: (formJson: FormJson<TForm>) => void
) => (e: FormEvent<HTMLFormElement>) => void

export const defineForm = <TForm extends FormBase>(definition: TForm): TForm => definition

const deriveFormState = <TForm extends FormBase>(
  formDefinition: TForm,
  formState: FormState<TForm>,
  setField: (name: string, value: any) => void
): DerivedFormState<TForm> => {
  const form: Record<string, DerivedFieldState | boolean> = { isValid: true }
  Object.keys(formDefinition).forEach((fieldName) => {
    const definition = formDefinition[fieldName]
    const state = formState[fieldName]
    const isValid =
      typeof definition.isValid === 'function' ? (definition.isValid as any)(state.value, formState) : true
    const isPristine = state.isPristine
    form[fieldName] = {
      ...state,
      isValid,
      flagError: !isPristine && !isValid,
      setValue: (value) => setField(fieldName, value),
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

const formStateFromDefinition = <TForm extends FormBase>(formDefinition: TForm): FormState<TForm> => {
  const form: Record<string, FieldState> = {}
  Object.keys(formDefinition).forEach((fieldName) => {
    form[fieldName] = {
      value: formDefinition[fieldName].value,
      isPristine: true,
    }
  })
  return form as FormState<TForm>
}

const formStateFromJson = <TForm extends FormBase>(formJson: FormJson<TForm>): FormState<TForm> => {
  const form: Record<string, FieldState> = {}
  Object.keys(formJson).forEach((fieldName) => {
    form[fieldName] = {
      value: formJson[fieldName],
      isPristine: true,
    }
  })
  return form as FormState<TForm>
}

export const useForm = <TForm extends FormBase>(
  formDefinition: TForm
): {
  form: DerivedFormState<TForm>
  reset: Reset<TForm>
  onSubmit: OnSubmit<TForm>
  formToJson: (form: FormState<TForm>) => FormJson<TForm>
} => {
  const [form, setForm] = useState<FormState<TForm>>(() => formStateFromDefinition(formDefinition))

  const setField = (name: string, value: any) => {
    setForm({
      ...form,
      [name]: {
        ...form[name],
        value,
        isPristine: false,
      },
    })
  }

  const reset = (formJson?: FormJson<TForm>) => {
    if (formJson) {
      setForm(formStateFromJson(formJson))
    } else {
      setForm(formStateFromDefinition(formDefinition))
    }
  }

  const formToJson = (): FormJson<TForm> => {
    const json: Record<string, FieldType> = {}
    Object.keys(form).forEach((field) => {
      json[field] = form[field].value
    })
    return json as FormJson<TForm>
  }

  const derivedForm = deriveFormState(formDefinition, form, setField)

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
