import React from 'react';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import Header from '../../components/Header/Header';
import AboutUsSection from '../../components/AboutUsSection/AboutUsSection';
import MenuSection from '../../components/MenuSection/MenuSection';
import ContactSection from '../../components/ContactSection/ContactSection';

/**
 * Root home-page React component that composes the main sections of the site.
 *
 * Renders a <div className="home-page"> containing Header, AboutUsSection,
 * MenuSection, ImageGallery, and ContactSection.
 *
 * Side effect: logs "CodeRabbit should review this change!" to the console when rendered.
 *
 * @returns {JSX.Element} The home page element.
 */
function Home() {
  console.log("CodeRabbit should review this change!");
  
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