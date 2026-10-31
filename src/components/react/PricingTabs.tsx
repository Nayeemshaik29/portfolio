import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Pkg = {
  title: string;
  blurb: string;
  price: { inr: string; usd: string };
  timeline: string;
  includes: readonly string[];
  proof: { label: string; href: string };
  featured: boolean;
};

// Development packages with an INR / USD currency switch.
export default function PricingTabs({ items, email }: { items: readonly Pkg[]; email: string }) {
  const mail = (s: string) =>
    `mailto:${email}?subject=${encodeURIComponent('Enquiry: ' + s)}&body=${encodeURIComponent(
      'Hi Nayeem,\n\nWhat I need:\n\nDeadline / budget (rough is fine):\n\nLinks (site, repo, docs):\n',
    )}`;

  const grid = (cur: 'inr' | 'usd') => (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((s, i) => (
        <motion.article
          key={s.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
          whileHover={{ y: -6 }}
          className={
            'relative flex flex-col rounded-2xl border bg-card/70 p-7 backdrop-blur ' +
            (s.featured ? 'border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_80px_-30px_rgba(255,255,255,.25)]' : '')
          }
        >
          {s.featured && (
            <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-0.5 font-mono text-[11px] text-primary-foreground">
              Most requested
            </span>
          )}
          <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">from</span>
            <span className="text-4xl font-semibold tracking-tight">{s.price[cur]}</span>
          </div>
          <p className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Clock className="size-3.5" /> {s.timeline}
          </p>
          <ul className="mt-5 grid flex-1 gap-2.5 text-sm">
            {s.includes.map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {x}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <Button asChild variant={s.featured ? 'default' : 'outline'}>
              <a href={mail(s.title)}>Get a quote</a>
            </Button>
            <a href={s.proof.href} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              See: {s.proof.label} →
            </a>
          </div>
        </motion.article>
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="inr">
      <TabsList aria-label="Currency">
        <TabsTrigger value="inr">₹ INR</TabsTrigger>
        <TabsTrigger value="usd">$ USD</TabsTrigger>
      </TabsList>
      <TabsContent value="inr">{grid('inr')}</TabsContent>
      <TabsContent value="usd">{grid('usd')}</TabsContent>
    </Tabs>
  );
}
