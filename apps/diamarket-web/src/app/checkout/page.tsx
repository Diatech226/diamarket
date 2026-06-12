import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CheckoutClient from './ui';

export default function CheckoutPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in?redirect_url=/checkout');
  return <CheckoutClient />;
}
