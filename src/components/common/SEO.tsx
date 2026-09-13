import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
}

const DEFAULT_TITLE = 'GameVault — PC Digital Game Catalog & Enquiry Platform';
const DEFAULT_DESCRIPTION =
  'Browse our curated catalog of 805 canonical PC digital games across Steam, Rockstar, EA, Ubisoft, and Battle.net. Manual enquiry and booking showcase.';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  canonicalUrl,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = title ? `${title} | GameVault` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (selector: string, attr: string, value: string) => {
      let meta = document.querySelector<HTMLMetaElement>(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (selector.includes('[property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) meta.setAttribute('property', prop);
        } else if (selector.includes('[name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute(attr, value);
    };

    // Description
    setMetaTag('meta[name="description"]', 'content', description);

    // Open Graph
    setMetaTag('meta[property="og:title"]', 'content', fullTitle);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:image"]', 'content', image);
    setMetaTag('meta[property="og:type"]', 'content', type);
    setMetaTag('meta[property="og:site_name"]', 'content', 'GameVault');

    // Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', image);

    // Canonical link
    const activeCanonical =
      canonicalUrl ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined);

    if (activeCanonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', activeCanonical);
    }
  }, [title, description, image, type, canonicalUrl]);

  return null;
};
