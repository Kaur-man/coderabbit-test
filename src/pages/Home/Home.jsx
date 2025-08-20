import React from 'react';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import Header from '../../components/Header/Header';
import AboutUsSection from '../../components/AboutUsSection/AboutUsSection';
import MenuSection from '../../components/MenuSection/MenuSection';
import ContactSection from '../../components/ContactSection/ContactSection';

/**
 * Root home-page component that composes and renders the main page sections.
 *
 * Renders a <div className="home-page"> containing Header, AboutUsSection,
 * MenuSection, ImageGallery, and ContactSection. As a side effect, it logs
 * "coderabbit called from HOME screen" to the console when rendered.
 * @returns {JSX.Element} The home page element.
 */
function Home() {
  const statusCheck = "coderabbit called from HOME screen"
  console.log("coderabbit called from HOME screen");
  
  return (
    <div className='home-page'>
        <Header />

        <AboutUsSection />

        <MenuSection />

        <ImageGallery />

        <ContactSection />
    </div>
  )
}

export default Home;