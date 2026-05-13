import Navbar from '../components/layout/Navbar'

function PublicLayout({ children }) {
  return (
    <div>

      <Navbar />

      {children}

    </div>
  )
}

export default PublicLayout