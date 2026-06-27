import { CmsFoundationPage } from "../../../cms-page";
export default function Page(){return <CmsFoundationPage title="Payouts vendeur" subtitle="Suivi et création des reversements vendeurs." endpoint="/vendors/:id/payouts" focus={["Solde","Historique","Nouveau payout"]} />;}
