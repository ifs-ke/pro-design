
import { getClients } from "@/lib/actions";
import { CrmPageClient } from './page-client';

export default async function CrmPage() {
    const clients = await getClients();

    return <CrmPageClient clients={clients} />;
}
