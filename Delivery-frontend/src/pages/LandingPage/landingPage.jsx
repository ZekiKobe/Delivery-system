import React from "react";
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'
import Feature from "../../components/Feature/Feature";
import Footer from "../../components/Footer/Footer";

const LandingPage = () => {

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar/>
            <Hero/>
            <Feature/>
            <Footer/>
        </div>
    )
}

export default LandingPage;