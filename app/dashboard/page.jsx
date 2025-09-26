import DashboardClientPage from './dashboard-client-page'

/**
 * This is the main server component for the dashboard.
 * It now renders the client page directly, which handles its own data fetching.
 * This prevents the entire page from being blocked by initial data load.
 */
export default function DashboardHome() {
  return <DashboardClientPage />
}
