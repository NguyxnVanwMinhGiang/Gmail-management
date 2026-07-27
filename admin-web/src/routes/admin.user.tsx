import { createFileRoute } from '@tanstack/react-router'
import UserPage from "../components/admin/UserPage";
export const Route = createFileRoute('/admin/user')({
  component: UserPage,
})
