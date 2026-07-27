import { createFileRoute } from "@tanstack/react-router";
import GoogleUserPage from "../components/admin/GoogleUserPage";

export const Route = createFileRoute("/admin/google-user")({
  component: GoogleUserPage,
});
