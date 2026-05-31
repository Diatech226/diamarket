import { PageHeader } from '@/components/ui/page-header';

const mockPages = [
  { id: 'home', title: 'Homepage', status: 'Published', updatedAt: '2026-04-10', blocks: 7 },
  { id: 'pricing', title: 'Pricing', status: 'Draft', updatedAt: '2026-04-11', blocks: 4 },
  { id: 'about', title: 'About', status: 'Published', updatedAt: '2026-04-09', blocks: 5 },
];

export default function CmsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="CMS Editor"
        description="Gestion de contenu premium avec édition en split view et actions publication."
        breadcrumbs={[{ label: 'Ops', href: '/admin' }, { label: 'CMS' }]}
      />

      <div className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Content list</div>
            <p className="panel__muted">Tableau des pages avec statut Draft/Published.</p>
          </div>
          <div className="panel__actions">
            <button className="button button--ghost">Preview</button>
            <button className="button button--secondary">Save draft</button>
            <button className="button button--primary">Publish</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Blocks</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table__body">
              {mockPages.map((page) => (
                <tr key={page.id}>
                  <td>{page.title}</td>
                  <td>{page.blocks}</td>
                  <td>
                    <span className={`badge ${page.status === 'Published' ? 'badge--success' : 'badge--warning'}`}>
                      {page.status}
                    </span>
                  </td>
                  <td>{page.updatedAt}</td>
                  <td>
                    <button className="button button--ghost button--sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cms-editor-grid">
        <section className="panel">
          <div className="panel__title">Page structure</div>
          <div className="cms-block-list">
            {['Hero section', 'Text block', 'Image block', 'CTA section'].map((block, index) => (
              <div className="cms-block" key={block}>
                <span className="badge badge--secondary">{index + 1}</span>
                <div>
                  <strong>{block}</strong>
                  <p className="muted">Editable content block</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__title">Live preview</div>
          <div className="cms-preview">
            <h3>Ship smarter with DiaExpress</h3>
            <p>
              Enterprise-grade logistics orchestration with transparent pricing, real-time tracking and
              predictable operations.
            </p>
            <button className="button button--primary">Get a Quote</button>
          </div>
        </section>
      </div>
    </div>
  );
}
