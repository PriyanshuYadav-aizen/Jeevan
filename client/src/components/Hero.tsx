import Navbar from "./Navbar";
import heroImg from "../assets/hero.avif";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <>
      <section className="w-full h-[100vh] min-h-[600px] sm:min-h-[700px] md:h-[90vh] lg:h-[88vh] flex items-center justify-center relative">
        <div className="absolute top-0 sm:top-4 left-0 right-0 sm:right-4 md:right-20 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-full sm:max-w-none">
            <Navbar />
          </div>
        </div>
        
        {/* Desktop View - Hero Image */}
        <div className="hidden md:block w-full h-full rounded-none sm:rounded-md overflow-hidden flex items-center justify-center bg-black/5">
          <img src={heroImg} alt="Hero" className="w-full h-full object-cover object-center" />
        </div>
        
        {/* Mobile View - Redesigned Hero Section */}
        <div className="md:hidden w-full h-full flex flex-col items-center justify-center px-6 py-20 relative z-10">
          <div className="text-center space-y-6 max-w-md">
            {/* Icon/Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                Healthcare at
                <br />
                <span className="text-teal-500">Your Doorstep</span>
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                Professional nurses, caretakers, and compounders available 24/7
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-500">10K+</div>
                <div className="text-xs text-gray-600">Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-500">15+</div>
                <div className="text-xs text-gray-600">Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-500">24/7</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Link 
                to="/browse"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg transition-colors"
              >
                Find Healthcare Provider
              </Link>
              <Link 
                to="/apply"
                className="w-full bg-white hover:bg-gray-50 text-teal-600 font-semibold py-3.5 px-6 rounded-lg border-2 border-teal-500 transition-colors"
              >
                Join as Professional
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="pt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified & Certified Professionals</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


