import { Metadata } from "next";
import PropertyClient from "./PropertyClient";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {

  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000/api/v1";

    const res = await fetch(`${apiUrl}/properties/${id}`);
    const data = await res.json();

    if (data && data.title) {
      return {
        title: `${data.title} | Luxora Estates`,
        description:
          data.description ||
          `View details of ${data.title} in ${data.location?.city}.`,
        openGraph: {
          images:
            data.media?.length > 0
              ? [data.media[0].media_url]
              : [],
        },
      };
    }
  } catch (err) {}

  return {
    title: "Property Details | Luxora Estates",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const resolvedParams = await params;
  const id = resolvedParams.id;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1";

  let property = null;

  try {
    const res = await fetch(`${apiUrl}/properties/${id}`, {
      cache: "no-store",
    });
    property = await res.json();
  } catch (e) {
    console.error("FETCH ERROR:", e);
  }

  return <PropertyClient id={id} initialData={property} />;
}