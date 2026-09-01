import catalog from "../../../../public/ccd-unified-structure-catalog.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ...catalog,
    api: {
      version: "v1",
      databaseVersion: "5.0",
      releaseDate: "2026-09-01",
      detailPathTemplate: "/compound/{lowercase-ccd-id}/",
    },
  });
}
