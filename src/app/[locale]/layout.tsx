import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import {
  getMessages as getRequestMessages,
  setRequestLocale,
} from 'next-intl/server';
import { getMessages, hasLocale, locales } from '@/i18n/config';
import '../../index.css';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = hasLocale(locale) ? locale : null;

  if (!normalizedLocale) {
    return { title: 'NeuroSync' };
  }

  const messages = await getMessages(normalizedLocale);

  return {
    title: 'NeuroSync',
    description: messages.metadata.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getRequestMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
