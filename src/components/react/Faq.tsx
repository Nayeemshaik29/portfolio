import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <Accordion type="single" collapsible defaultValue="q0" className="rounded-2xl border bg-card/60 px-6 backdrop-blur">
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`q${i}`}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent className="text-[0.95rem] leading-relaxed">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
