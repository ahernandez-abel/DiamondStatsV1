import Navbar from '../components/layout/Navbar';

function PublicLayout({ children, tenantSlug }) {
  return (
    <div>
      <Navbar tenantSlug={tenantSlug} />

      {children}

      <footer className="app-footer">
        <div className="footer-brand">
          <span className="footer-logo">
            AbelDev
          </span>

          <span className="footer-copy">
            © 2026 DiamondStats • Sistema desarrollado por AbelDev
          </span>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;