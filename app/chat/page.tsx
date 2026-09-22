import type { Metadata } from "next";
import PropertyChatWidget from "@/components/common/PropertyChatWidget";

export const metadata: Metadata = {
  title: "AI Property Advisor | Luxora Estates",
  description: "Find your ideal property with Luxora AI conversational search and recommendations.",
};

export default function ChatPage() {
  return <PropertyChatWidget isFullScreen={true} />;
}