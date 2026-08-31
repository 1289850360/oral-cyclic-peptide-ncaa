import scaffolds from "../../../../public/cyclic-scaffold-evidence.json";
export const dynamic = "force-static";
export function GET() { return Response.json({ ...scaffolds, api: { version: "v1", databaseVersion: "3.3", releaseDate: "2026-08-31" } }); }
