import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Landing } from "@/components/landing/Landing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Mnemo Brain",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description:
    "Your Second Brain, Powered by AI. Capture ideas, organize knowledge, and retrieve information instantly with intelligent memory.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "10000",
  },
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
