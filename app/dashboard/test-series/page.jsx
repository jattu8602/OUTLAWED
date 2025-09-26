import TestSeriesClientPage from './test-series-client-page'

export const metadata = {
  title: 'Test Series | OUTLAWED',
  description: 'Engage with curated series of tests to boost your preparation.',
}

export default function TestSeriesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        Test Series
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Engage with curated series of tests to boost your preparation.
      </p>
      <TestSeriesClientPage />
    </div>
  )
}
