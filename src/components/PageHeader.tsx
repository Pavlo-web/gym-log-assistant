interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
      {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
    </header>
  );
}
