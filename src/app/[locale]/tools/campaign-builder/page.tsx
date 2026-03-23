import { Suspense } from "react";
import CampaignBuilder from "@/components/CampaignBuilder";

export default function CampaignBuilderPage() {
  return (
    <Suspense>
      <CampaignBuilder />
    </Suspense>
  );
}
