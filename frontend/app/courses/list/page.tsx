'use client';

import { useState } from 'react';
import Image from 'next/image';

// Datos estáticos de prueba
const MOCK_COURSES = [
  {
    id: '1',
    name: 'English I',
    description: 'Learn the fundamentals of English grammar, vocabulary, and conversation skills. Perfect for beginners.'
  },
  {
    id: '2',
    name: 'Integral Calculus',
    description: 'Master integration techniques, series, sequences, and advanced calculus concepts.'
  },
  {
    id: '3',
    name: 'Programming II',
    description: 'Advanced programming concepts including OOP, frameworks, inheritance, and abstraction.'
  },
  {
    id: '4',
    name: 'Data Structures',
    description: 'Explore fundamental data structures like arrays, linked lists, trees, and graphs.'
  },
  {
    id: '5',
    name: 'Database Systems',
    description: 'Learn relational databases, SQL, normalization, and database design principles.'
  }
];

export default function CoursesListPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Mínima distancia de swipe requerida (en px)
  const minSwipeDistance = 50;

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? MOCK_COURSES.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setCurrentIndex((prev) => (prev === MOCK_COURSES.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  const getPreviousIndex = () => {
    return currentIndex === 0 ? MOCK_COURSES.length - 1 : currentIndex - 1;
  };

  const getNextIndex = () => {
    return currentIndex === MOCK_COURSES.length - 1 ? 0 : currentIndex + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6 md:p-8">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="transition-transform duration-300 hover:scale-110 focus:outline-none"
          aria-label="Go to dashboard"
        >
          <Image
            src="/assets/logo_yellow.png"
            alt="Logo"
            width={200}
            height={200}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-30 lg:h-30 object-contain cursor-pointer"
            unoptimized
            quality={100}
          />
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-center mb-6 sm:mb-8 md:mb-12 pt-16 sm:pt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">Material All Courses</h1>
          </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            disabled={isAnimating}
            className="hidden md:flex z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-500 hover:bg-yellow-400 hover:scale-110 transition-all duration-300 items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            aria-label="Previous course"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cards Container */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-5xl overflow-hidden">
            {/* Previous Card Preview */}
            <div className="hidden lg:block w-48 xl:w-64 transform scale-75 opacity-40 transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 xl:p-8 shadow-xl h-48 lg:h-56 xl:h-64">
                <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-white mb-2 lg:mb-3 xl:mb-4">
                  {MOCK_COURSES[getPreviousIndex()].name}
                </h2>
                <p className="text-gray-300 text-xs lg:text-sm line-clamp-3 lg:line-clamp-4">
                  {MOCK_COURSES[getPreviousIndex()].description}
                </p>
              </div>
            </div>

            {/* Current Card */}
            <div 
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                key={currentIndex}
                className={`bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl h-64 sm:h-72 md:h-80 lg:h-96 flex flex-col justify-center transform transition-all duration-500 select-none ${
                  isAnimating
                    ? direction === 'right'
                      ? 'animate-slide-from-right'
                      : 'animate-slide-from-left'
                    : ''
                }`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                  {MOCK_COURSES[currentIndex].name}
                </h2>
                <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                  {MOCK_COURSES[currentIndex].description}
                </p>
              </div>
            </div>

            {/* Next Card Preview */}
            <div className="hidden lg:block w-48 xl:w-64 transform scale-75 opacity-40 transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 xl:p-8 shadow-xl h-48 lg:h-56 xl:h-64">
                <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-white mb-2 lg:mb-3 xl:mb-4">
                  {MOCK_COURSES[getNextIndex()].name}
                </h2>
                <p className="text-gray-300 text-xs lg:text-sm line-clamp-3 lg:line-clamp-4">
                  {MOCK_COURSES[getNextIndex()].description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="hidden md:flex z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-500 hover:bg-yellow-400 hover:scale-110 transition-all duration-300 items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            aria-label="Next course"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 md:mt-12">
          {MOCK_COURSES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating && index !== currentIndex) {
                  setIsAnimating(true);
                  setDirection(index > currentIndex ? 'right' : 'left');
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'w-6 sm:w-8 bg-yellow-400'
                  : 'w-1.5 sm:w-2 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to course ${index + 1}`}
            />
          ))}
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-from-right {
          from {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-from-left {
          from {
            transform: translateX(-100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        .animate-slide-from-right {
          animation: slide-from-right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slide-from-left {
          animation: slide-from-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
