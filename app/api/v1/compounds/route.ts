import catalog from "../../../../public/ccd-unified-structure-catalog.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ...catalog,
    api: {
      version: "v1",
      databaseVersion: "5.2",
      releaseDate: "2026-09-02",
      detailPathTemplate: "/compound/{lowercase-ccd-id}/",
    },
  });
}
