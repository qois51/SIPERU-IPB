import React from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/landing/Hero';
import Steps from '../../components/landing/Steps';
import Rules from '../../components/landing/Rules';
import Stats from '../../components/landing/Stats';
import Faculties from '../../components/landing/Faculties';
import RoomCatalog from '../../components/landing/RoomCatalog';
import FAQ from '../../components/landing/FAQ';
import CTA from '../../components/landing/CTA';
import Footer from '../../components/Footer';

// Styles
import '../../styles/landing/landing.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Steps />
      <Rules />
      <Stats />
      <Faculties />
      <RoomCatalog />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
