import catalog from "../../../../public/ccd-unified-structure-catalog.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ...catalog,
    api: {
      version: "v1",
      databaseVersion: "3.3",
      releaseDate: "2026-08-31",
      detailPathTemplate: "/compound/{lowercase-ccd-id}/",
    },
  });
}
