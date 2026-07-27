import { createFileRoute } from "@tanstack/react-router";
import AdministratorPage from "../components/admin/AdministratorPage";

export const Route = createFileRoute("/admin/administrator")({
  component: AdministratorPage,
});
