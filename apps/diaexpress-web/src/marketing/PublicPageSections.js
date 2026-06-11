import React from 'react';

export const PublicReveal = ({ children }) => <div data-reveal>{children}</div>;

export const PublicSection = ({ title, description, children, blockId }) => (
  <section className="dx-section" data-reveal data-cms-block={blockId || title}>
    <div className="dx-container">
      <header className="dx-section__header">
        <h2 className="dx-section__title">{title}</h2>
        {description ? <p className="dx-section__subtitle">{description}</p> : null}
      </header>
      {children}
    </div>
  </section>
);
