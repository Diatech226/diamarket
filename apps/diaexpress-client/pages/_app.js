import React from 'react';
import { useRouter } from 'next/router';
import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import Header from '@diaexpress/shared/components/Header';
import { AuthProvider } from '@diaexpress/shared/auth/AuthContext';
import '@diaexpress/shared/styles/App.css';
import '../src/styles/diaexpress-theme.css';
import '../src/styles/design-tokens.css';
import '../src/styles/public-design-tokens.css';
import { useBackendAuth } from '@diaexpress/shared/auth/useBackendAuth';
import { useSafeClerk, useSafeUser } from '@diaexpress/shared/auth/useSafeClerk';

const clerkPubKey = 'pk_test_YWxsb3dpbmctcG9sbGl3b2ctMjYuY2xlcmsuYWNjb3VudHMuZGV2JA';

const AppWithClerk = ({ Component, pageProps }) => {
  const router = useRouter();
  const { user, isLoaded } = useSafeUser();
  const { getToken } = useBackendAuth();
  const { signOut } = useSafeClerk();

  const [hasMounted, setHasMounted] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSignOut = React.useCallback(() => {
    signOut(() => (window.location.href = '/'));
  }, [signOut]);


  React.useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleDone = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [router.events]);

  const canRenderAuthUI = hasMounted && isLoaded;

  const resolvedUser = canRenderAuthUI ? user : null;
  const resolvedSignInButton = canRenderAuthUI ? SignInButton : null;
  const resolvedUserButton = canRenderAuthUI ? UserButton : null;
  const resolvedSignOut = canRenderAuthUI ? handleSignOut : undefined;

  return (
    <AuthProvider clerkUser={resolvedUser} isUserLoaded={isLoaded} getToken={getToken}>
      <div className={`dx-route-progress ${isNavigating ? 'dx-route-progress--active' : ''}`} aria-hidden="true" />
      <Header
        user={resolvedUser}
        onSignOut={resolvedSignOut}
        SignInButtonComponent={resolvedSignInButton}
        UserButtonComponent={resolvedUserButton}
        isAuthReady={canRenderAuthUI}
      />
      <div className="dx-page-transition">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
};

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider publishableKey={clerkPubKey} {...pageProps}>
      <AppWithClerk Component={Component} pageProps={pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
