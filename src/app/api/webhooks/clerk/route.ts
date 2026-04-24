import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { fetchMutation } from 'convex/nextjs';
import { api, internal } from '@/convex/_generated/api';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Clerk issuer domain includes the instance URL
    const issuerUrl =
      process.env.CLERK_JWT_ISSUER_DOMAIN ||
      `https://${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('clerk.')[1]}`;
    // Token identifier format for Convex:
    const tokenIdentifier = `${issuerUrl}|${id}`;

    const primaryEmail =
      email_addresses.find((email) => email.id === evt.data.primary_email_address_id)
        ?.email_address ||
      email_addresses[0]?.email_address ||
      '';

    const name = [first_name, last_name].filter(Boolean).join(' ') || 'Unknown User';

    try {
      await fetchMutation(api.users.createUser, {
        tokenIdentifier,
        email: primaryEmail,
        name,
        role: 'Creator', // Default role for new signups, can be changed by admin later
      });
    } catch (error) {
      console.error('Error syncing user to Convex:', error);
      return new Response('Error syncing user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const issuerUrl =
      process.env.CLERK_JWT_ISSUER_DOMAIN ||
      `https://${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('clerk.')[1]}`;
    const tokenIdentifier = `${issuerUrl}|${id}`;

    const primaryEmail =
      email_addresses.find((email) => email.id === evt.data.primary_email_address_id)
        ?.email_address ||
      email_addresses[0]?.email_address ||
      '';

    const name = [first_name, last_name].filter(Boolean).join(' ') || 'Unknown User';

    try {
      await fetchMutation(api.users.updateUser, {
        tokenIdentifier,
        email: primaryEmail,
        name,
      });
    } catch (error) {
      console.error('Error updating user in Convex:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (!id) return new Response('No user ID provided', { status: 400 });

    const issuerUrl =
      process.env.CLERK_JWT_ISSUER_DOMAIN ||
      `https://${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('clerk.')[1]}`;
    const tokenIdentifier = `${issuerUrl}|${id}`;

    try {
      await fetchMutation(api.users.deleteUser, {
        tokenIdentifier,
      });
    } catch (error) {
      console.error('Error deleting user in Convex:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
