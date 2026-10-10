const APP_NAME = "Gym Log";

export const pageMeta = (title: string, description: string) => {
  const fullTitle = `${title} — ${APP_NAME}`;
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
};
