import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

type FieldPresentation = { label: string; hint?: ReactNode; error?: string }
type NativeField = { id?: string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' }

function useField(props: FieldPresentation & NativeField) {
  const generated = useId()
  const id = props.id || generated
  return { id, 'aria-invalid': props.error ? true : props['aria-invalid'], 'aria-describedby': [props['aria-describedby'], props.hint && `${id}-hint`, props.error && `${id}-error`].filter(Boolean).join(' ') || undefined }
}
function FieldFrame({ id, label, hint, error, required, children }: FieldPresentation & { id: string; required?: boolean; children: ReactNode }) {
  return <div className="ui-field"><div className="ui-field-label"><label htmlFor={id}>{label}</label>{required && <span className="ui-required" aria-hidden="true">(ضروری)</span>}</div>{children}{hint && <div className="ui-field-hint" id={`${id}-hint`}>{hint}</div>}{error && <div className="ui-field-error" id={`${id}-error`}>{error}</div>}</div>
}

export function InputField({ label, hint, error, className = '', ...props }: FieldPresentation & InputHTMLAttributes<HTMLInputElement>) {
  const field = useField({ label, hint, error, ...props })
  return <FieldFrame {...{label,hint,error}} id={field.id} required={props.required}><input {...props} {...field} className={`ui-input ${className}`}/></FieldFrame>
}
export function TextareaField({ label, hint, error, className = '', ...props }: FieldPresentation & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useField({ label, hint, error, ...props })
  return <FieldFrame {...{label,hint,error}} id={field.id} required={props.required}><textarea {...props} {...field} className={`ui-input ${className}`}/></FieldFrame>
}
export function SelectField({ label, hint, error, children, className = '', ...props }: FieldPresentation & SelectHTMLAttributes<HTMLSelectElement>) {
  const field = useField({ label, hint, error, ...props })
  return <FieldFrame {...{label,hint,error}} id={field.id} required={props.required}><select {...props} {...field} className={`ui-input ${className}`}>{children}</select></FieldFrame>
}

export function CheckField({ label, hint, error, type = 'checkbox', className = '', ...props }: FieldPresentation & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { type?: 'checkbox' | 'radio' }) {
  const field = useField({ label, hint, error, ...props })
  return <div className="ui-field"><label className="ui-check" htmlFor={field.id}><input {...props} {...field} type={type} className={className}/><span>{label}{props.required && <span className="ui-required" aria-hidden="true"> (ضروری)</span>}</span></label>{hint && <div className="ui-field-hint" id={`${field.id}-hint`}>{hint}</div>}{error && <div className="ui-field-error" id={`${field.id}-error`}>{error}</div>}</div>
}
