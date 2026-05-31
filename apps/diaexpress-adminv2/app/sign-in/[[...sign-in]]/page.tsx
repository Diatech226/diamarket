import { SignIn } from '@clerk/nextjs';
import { getClerkRuntimeConfig } from '@/lib/config/env';
import { AuthUnavailable } from '@/components/system/auth-unavailable';

export default function SignInPage() {
  const clerkConfig = getClerkRuntimeConfig();

  if (!clerkConfig.enabled) {
    return <AuthUnavailable missingKeys={clerkConfig.missingKeys} detail="sign-in-disabled" />;
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <h1 className="panel__title">Connexion admin</h1>
        <p className="panel__muted">Authentifiez-vous avec votre compte DiaExpress Admin.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <SignIn routing="path" path="/sign-in" />
        </div>
      </div>
    </div>
  );
}
