import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundImg from '../assets/home/error.webp'; 

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-white font-sans flex flex-col items-center">
            {/* 1. Main Container: Relative so content can be placed over the image */}
            <div className="py-12 md:py-12 relative w-full max-w-[2000px] flex justify-center">
                
                {/* 2. The Illustration */}
                <img 
                    src={NotFoundImg} 
                    alt="404 Error" 
                    className="w-full h-auto object-contain"
                />

                {/* 3. Absolute Overlay: This is the secret to getting it exactly like the image */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-[20%] md:pt-[15%] text-center px-4">
                    
                    {/* The Text - Positioned to sit in that white space between characters */}
                    <div className="mb-4 md:mb-8">
                        <h2 className="text-gray-500 text-lg md:text-2xl font-medium leading-tight">
                            Oops!! This page seems to <br /> 
                            be on vacation. Try again <br />
                            later!
                        </h2>
                    </div>

                    {/* The Button */}
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#F2994A] text-white px-8 md:px-12 py-3 rounded-md font-bold text-xs md:text-sm tracking-widest uppercase hover:bg-[#e88a35] transition-all shadow-md active:scale-95"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;