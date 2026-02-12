import mongoose from 'mongoose';
import { getTenantModel } from './utils/tenantManager.js';

// Test data for hero
const heroData = {
  lang: 'en',
  title: 'Scale Your Business with Dedicated Virtual Assistants',
  subtitle: 'Hire pre-vetted, German-speaking virtual assistants for 80% less than local hires. Scale your team in days, not months.',
  tagline: 'Trusted by 200+ Growing Businesses',
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=900&fit=crop&q=80',
  ctaPrimary: 'Get Started Today',
  urgency: 'Limited Offer',
  stats: {
    clients: '200+',
    costSaved: '70%',
    rating: '4.9/5'
  }
};

async function testHeroInsert() {
  try {
    console.log('Testing hero data insertion...');
    
    // Import Hero schema
    const HeroSchema = (await import('./models/Hero.js')).default;
    
    // Get tenant model
    const Hero = await getTenantModel('donva', 'Hero', HeroSchema);
    
    // Insert hero data
    const hero = await Hero.findOneAndUpdate(
      { lang: 'en' },
      heroData,
      { upsert: true, new: true }
    );
    
    console.log('✅ Hero data inserted successfully:', hero);
    
    // Test retrieval
    const retrievedHero = await Hero.findOne({ lang: 'en' }).lean();
    console.log('✅ Hero data retrieved successfully:', retrievedHero);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testHeroInsert();
