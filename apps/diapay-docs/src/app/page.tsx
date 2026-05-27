const pages = ['Introduction','Authentication','Payments','Webhooks','SDK JavaScript','Sandbox','Errors'];
export default function DocsHome() {
  return <main><h1>Diapay Docs</h1><ul>{pages.map((p) => <li key={p}>{p}</li>)}</ul></main>;
}
