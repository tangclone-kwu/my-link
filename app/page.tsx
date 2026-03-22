import { Card } from "@/components/ui/card"
import { DUMMY_LINKS } from "@/data/links"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="flex w-full max-w-md flex-col gap-4">
        {DUMMY_LINKS.map((link) => (
          <a
            key={link.linkId}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full transition-transform hover:scale-[1.02]"
          >
            <Card className="flex h-16 items-center justify-center px-4 hover:bg-accent/50 transition-colors">
              <span className="font-medium text-base">{link.title}</span>
            </Card>
          </a>
        ))}
      </div>
    </main>
  )
}
