export function FormInput({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-1 block text-sm text-zinc-700 dark:text-zinc-200">{label}</span><input type={type} placeholder={placeholder} className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" /></label>;
}
