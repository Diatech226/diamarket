import { CmsFoundationPage } from "../../../cms-page";
export default function Page(){return <CmsFoundationPage title="Messagerie vendeur" subtitle="Historique des conversations et support vendeur." endpoint="/vendors/:id/messaging" focus={["Messages","SLA support","Pièces jointes"]} />;}
