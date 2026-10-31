import { useState } from 'react';
import { Menu, Download, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

type Item = { href: string; label: string };

export default function MobileNav({ items, path }: { items: Item[]; path: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="font-mono text-sm text-muted-foreground">&lt;NS/&gt; menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
          {items.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${80 + i * 50}ms` }}
              className={
                'animate-in fade-in slide-in-from-right-4 fill-mode-both rounded-xl px-4 py-3 text-2xl font-medium tracking-tight transition hover:bg-accent ' +
                (path === n.href ? 'text-foreground' : 'text-muted-foreground')
              }
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          <Button asChild size="lg">
            <a href="/freelance" onClick={() => setOpen(false)}>
              <Sparkles /> Hire me / Freelance
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/resume.pdf" target="_blank" rel="noopener">
              <Download /> Resume
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
