import VendorHubPage from "../VendorHubPage";
export default function Page({ params }: { params: { id: string } }) { return <VendorHubPage id={params.id} section="catalog" />; }
