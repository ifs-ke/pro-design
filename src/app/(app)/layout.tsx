
import { getClients, getProperties, getProjects, getQuotes } from "@/lib/actions";
import StoreInitializer from "@/components/store-initializer";
import AppShell from "./app-shell";

export default async function AppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: any;
}) {
    const [clients, properties, projects, quotes] = await Promise.all([
        getClients(),
        getProperties(),
        getProjects(),
        getQuotes(),
    ]);

  return (
      <AppShell params={params}>
          <StoreInitializer 
            clients={JSON.parse(JSON.stringify(clients))} 
            properties={JSON.parse(JSON.stringify(properties))} 
            projects={JSON.parse(JSON.stringify(projects))} 
            quotes={JSON.parse(JSON.stringify(quotes))} 
            />
          {children}
      </AppShell>
  );
}
