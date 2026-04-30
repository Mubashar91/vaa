import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  noindex?: boolean;
}

const OG_IMAGE_DEFAULT = 'https://don-va.com/og-image.jpg';

export function useSEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = OG_IMAGE_DEFAULT,
  keywords,
  noindex = false,
}: SEOOptions) {
  useEffect(() => {
    document.title = title;

    setMetaName('description', description);
    setMetaName('robots', noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1');
    if (keywords) setMetaName('keywords', keywords);

    if (canonical) setLinkCanonical(canonical);

    setMetaProp('og:title', title);
    setMetaProp('og:description', description);
    setMetaProp('og:type', ogType);
    if (canonical) setMetaProp('og:url', canonical);
    setMetaProp('og:image', ogImage);

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', ogImage);
  }, [title, description, canonical, ogType, ogImage, keywords, noindex]);
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaProp(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
