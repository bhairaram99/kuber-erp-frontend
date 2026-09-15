'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageLoader } from '../common/page-loader';

function isModifiedClick(event: MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function getInternalHref(anchor: HTMLAnchorElement): string | null {
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download')) return null;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const showTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);

  const clearPending = () => {
    if (showTimer.current) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (safetyTimer.current) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
    setIsNavigating(false);
  };

  useEffect(() => {
    clearPending();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || isModifiedClick(event)) return;

      const nextHref = getInternalHref(anchor);
      if (!nextHref) return;

      const nextUrl = new URL(nextHref, window.location.origin);
      if (
        nextUrl.pathname === window.location.pathname &&
        nextUrl.search === window.location.search
      ) {
        return;
      }

      if (showTimer.current) window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => {
        setIsNavigating(true);
        safetyTimer.current = window.setTimeout(() => {
          setIsNavigating(false);
        }, 8000);
      }, 80);

      if (!event.defaultPrevented) {
        event.preventDefault();
        router.push(nextHref);
      }
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      if (showTimer.current) window.clearTimeout(showTimer.current);
    };
  }, [router]);

  return (
    <>
      {isNavigating && (
        <div className="fixed top-16 left-0 right-0 bottom-0 lg:left-64 z-20 flex items-center justify-center bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-[1px]">
          <PageLoader />
        </div>
      )}
      <div className={isNavigating ? 'pointer-events-none opacity-40' : undefined}>
        {children}
      </div>
    </>
  );
}
