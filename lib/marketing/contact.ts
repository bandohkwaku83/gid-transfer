import { APP_NAME } from "@/lib/branding";
import { contactEmail } from "@/lib/marketing/faqs";

export { contactEmail };

export const contactTopics = [
  { id: "general", label: "General question" },
  { id: "pricing", label: "Pricing or plans" },
  { id: "migration", label: "Moving from another tool" },
  { id: "studio", label: "Studio / team setup" },
  { id: "support", label: "Help with my account" },
] as const;

export type ContactTopicId = (typeof contactTopics)[number]["id"];

export type ContactFormValues = {
  name: string;
  email: string;
  studio?: string;
  topic: ContactTopicId;
  message: string;
};

export function contactTopicLabel(id: ContactTopicId): string {
  return contactTopics.find((t) => t.id === id)?.label ?? "General question";
}

export function buildContactMailto(values: ContactFormValues): string {
  const topic = contactTopicLabel(values.topic);
  const subject = `${APP_NAME}: ${topic} — ${values.name.trim() || "inquiry"}`;
  const lines = [
    values.message.trim(),
    "",
    "---",
    `Topic: ${topic}`,
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    values.studio?.trim() ? `Studio: ${values.studio.trim()}` : null,
  ].filter(Boolean);

  const params = new URLSearchParams({
    subject,
    body: lines.join("\n"),
  });
  return `mailto:${contactEmail}?${params.toString()}`;
}

export const contactEditorialImage = {
  src: "/images/gallery-covers/IMG_5566.JPG",
  alt: "Portrait session in a photography studio",
  caption: "Studios worldwide deliver with Gidtransfer",
} as const;
