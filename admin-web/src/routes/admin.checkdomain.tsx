import { createFileRoute } from '@tanstack/react-router'
import CheckDomain from "../components/admin/CheckDomain";

export const Route = createFileRoute('/admin/checkdomain')({
  component: CheckDomain,
})