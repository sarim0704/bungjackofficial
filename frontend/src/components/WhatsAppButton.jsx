import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ link }) {
  if (!link) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_0_30px_rgba(37,211,102,0.32)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(37,211,102,0.42)]"
    >
      <MessageCircle size={24} />
    </a>
  );
}
