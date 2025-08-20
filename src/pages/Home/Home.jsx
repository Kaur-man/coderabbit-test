import React from 'react';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import Header from '../../components/Header/Header';
import AboutUsSection from '../../components/AboutUsSection/AboutUsSection';
import MenuSection from '../../components/MenuSection/MenuSection';
import ContactSection from '../../components/ContactSection/ContactSection';

/**
 * Root home-page component that composes and renders the page sections.
 *
 * Renders a container with className "home-page" containing Header, AboutUsSection,
 * MenuSection, ImageGallery, and ContactSection.
 * @return {JSX.Element} The home page element.
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