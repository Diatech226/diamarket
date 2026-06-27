import { CmsFoundationPage } from "../../../cms-page";
export default function Page(){return <CmsFoundationPage title="Home Builder" subtitle="Composition des blocs Hero, carrousel, produits vedettes, FAQ et CTA." endpoint="/storefront/:vendor_id/pages/home" focus={["Hero","Collections","FAQ/CTA"]} />;}
