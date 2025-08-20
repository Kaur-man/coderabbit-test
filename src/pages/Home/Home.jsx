import React from 'react';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import Header from '../../components/Header/Header';
import AboutUsSection from '../../components/AboutUsSection/AboutUsSection';
import MenuSection from '../../components/MenuSection/MenuSection';
import ContactSection from '../../components/ContactSection/ContactSection';

/**
 * Home page component that composes Header, AboutUsSection, MenuSection, ImageGallery, and ContactSection.
 *
 * Renders the main `.home-page` container. Emits `console.log("coderabbit called from HOME screen")` on each render.
 * @return {JSX.Element} The rendered home page element.
 */
function Home() {
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