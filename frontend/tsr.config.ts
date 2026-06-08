import { defineConfig } from "@tanstack/router-generator/config";
export default defineConfig({
routesDirectory: "./src/routes",
generatedRouteTree: "./src/routeTree.gen.ts",
});
