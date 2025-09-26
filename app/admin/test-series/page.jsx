import AdminTestSeriesClientPage from './test-series-client-page'

export const metadata = {
  title: 'Manage Test Series | Admin',
  description: 'Create, edit, and manage test series for your users.',
}

export default function AdminTestSeriesPage() {
  return (
    <div className="p-2 sm:p-4 lg:p-6">

      <AdminTestSeriesClientPage />
    </div>
  )
}
