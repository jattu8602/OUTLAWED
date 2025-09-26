import FreeTestClientPage from './free-test-client-page'

/**
 * Server component for the free tests page.
 * It now renders the client page directly, which handles its own data fetching.
 */
export default function FreeTestsPage() {
  return <FreeTestClientPage />
}
