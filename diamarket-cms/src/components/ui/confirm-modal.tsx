export function ConfirmModal({ label = "Supprimer" }: { label?: string }) {
  return <button className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white">{label}</button>;
}
