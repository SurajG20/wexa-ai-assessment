import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getFacilities } from "@/lib/services";
import { ImpactSimulator } from "./impact-simulator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impact Simulator",
};

export default async function ImpactPage() {
  const facilities = await getFacilities();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Blast-radius analysis"
        title="Impact Simulator"
        description="Take a fab offline and watch the failure propagate: the query traverses facility → supplier → part → bill of material → product, then ranks finished products by annual revenue at risk."
      />
      <Suspense>
        <ImpactSimulator facilities={facilities} />
      </Suspense>
    </div>
  );
}
