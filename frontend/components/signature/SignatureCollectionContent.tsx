'use client';

import React from 'react';
import { BroastPromoBanner } from '@/components/home/BroastPromoBanner';

export const SignatureCollectionContent: React.FC = () => {
  return (
    <div className="w-full">
      <BroastPromoBanner
        buttonText="Explore Signature Collection"
        buttonHref="/products/broast-masala-powder"
      />
    </div>
  );
};

export default SignatureCollectionContent;
