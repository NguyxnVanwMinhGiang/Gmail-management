import { createFileRoute } from '@tanstack/react-router'
import OrderPage from "../components/admin/OrderPage";

export const Route = createFileRoute('/admin/order')({
  component: OrderPage,
})