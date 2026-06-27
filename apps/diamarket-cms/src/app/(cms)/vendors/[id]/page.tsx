import { CmsFoundationPage } from "../../cms-page";
export default function Page(){return <CmsFoundationPage title="Profil vendeur" subtitle="Vue 360° du vendeur, conformité, catalogue et performance." endpoint="/vendors/:id" focus={["Identité","Catalogue","Risques"]} />;}
