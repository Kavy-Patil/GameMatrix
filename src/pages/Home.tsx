import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { PlatformSection } from '../components/home/PlatformSection';
import { GenreSection } from '../components/home/GenreSection';
import { DealsSection } from '../components/home/DealsSection';
import { ValueProps } from '../components/home/ValueProps';
import { catalogService } from '../services/catalogService';
import { SEO } from '../components/common/SEO';

export const Home: React.FC = () => {
  const allGames = catalogService.getAllGames();

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Curated PC Digital Game Catalog"
        description="Discover 805 verified digital PC game titles on GameVault across Steam, Epic Games, Rockstar, Ubisoft, and Battle.net. Manual booking and personal enquiry assistance."
        canonicalUrl="/"
      />
      <HeroSection />
      <HowItWorksSection />
      <FeaturedSection games={allGames} />
      <PlatformSection />
      <GenreSection />
      <DealsSection games={allGames} />
      <ValueProps />
    </div>
  );
};
