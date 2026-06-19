export function FormInput({ label, placeholder, type = "text", error }: { label: string; placeholder?: string; type?: string; error?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <label className="block" htmlFor={id}><span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</span><input id={id} type={type} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="admin-field" />{error && <span id={`${id}-error`} className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
