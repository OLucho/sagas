import Link from "next/link";
import { ArrowRight, Share2, Search, List, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Explora todos los sets",
    description:
      "Accede a la base de datos completa de Pokemon TCG. Desde Base Set hasta Scarlet & Violet.",
  },
  {
    icon: List,
    title: "Crea listas personalizadas",
    description:
      "Organiza tu inventario en listas. Marca variantes: normal, holo, reverse y más.",
  },
  {
    icon: Share2,
    title: "Comparte con clientes",
    description:
      "Genera links públicos de tus listas. Mejor que publicar fotos en Instagram.",
  },
];

const stats = [
  { value: "15,000+", label: "Cartas disponibles" },
  { value: "150+", label: "Sets y expansiones" },
  { value: "100%", label: "Gratis" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Gestiona tu colección Pokemon TCG
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              La herramienta definitiva para vendedores de cartas Pokemon en Argentina. 
              Organiza tu inventario, rastrea variantes y comparte listas con tus clientes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                <Link href="/sets">
                  Explorar sets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/sets">
                  Ver demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Funcionalidades
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Todo lo que necesitas para vender cartas
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Olvídate de las planillas de Excel y las fotos en Instagram. 
              Sagas te da las herramientas profesionales que necesitas.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple como 1, 2, 3
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Empieza a organizar tu colección en minutos.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Explora los sets",
                description: "Navega por todas las expansiones de Pokemon TCG y encuentra las cartas que tienes.",
              },
              {
                step: "2",
                title: "Marca tus cartas",
                description: "Selecciona las variantes que tienes de cada carta: normal, holo, reverse, etc.",
              },
              {
                step: "3",
                title: "Comparte tu lista",
                description: "Genera un link público y compártelo con tus clientes por WhatsApp o redes sociales.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 sm:p-12 lg:p-16">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Empieza a organizar tu colección hoy
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Es gratis y no necesitas crear una cuenta para explorar. 
                Registrate solo cuando quieras guardar tus listas.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/sets">
                    Comenzar ahora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <span className="text-sm font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-semibold text-foreground">Sagas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hecho con amor para la comunidad Pokemon de Argentina
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
