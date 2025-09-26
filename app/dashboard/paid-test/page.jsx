import PaidTestClientPage from './paid-test-client-page'

/**
 * Server component for the paid tests page.
 * It now renders the client page directly, which handles its own data fetching.
 */
export default function PaidTestsPage() {
  return <PaidTestClientPage />
}
