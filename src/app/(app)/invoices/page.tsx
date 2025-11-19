
import { getClients, getInvoices, getProjects, getQuotes } from "@/lib/actions";
import { InvoicesPageClient } from "./page-client";

export default async function InvoicesPage() {
    const invoices = await getInvoices();
    const clients = await getClients();
    const projects = await getProjects();
    const quotes = await getQuotes();

    return <InvoicesPageClient invoices={invoices} clients={clients} projects={projects} quotes={quotes} />;
}
