import React from 'react';
import { FileText, Video, Sparkles, Zap, Brain } from 'lucide-react';

export default function ProcessingAnimation({ message }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] relative z-10">
            {/* 3D Scene Container */}
            <div className="relative w-80 h-80 mb-8" style={{ perspective: '1000px' }}>

                {/* Central Sphere */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-32 h-32">
                        {/* Glowing core */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse shadow-2xl shadow-purple-500/50" />
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-200 via-purple-300 to-pink-300 animate-pulse" style={{ animationDelay: '1s' }} />

                        {/* Sparkle effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                </div>

                {/* Orbit Ring 1 - Files */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                    <div className="absolute inset-0 animate-spin-slow" style={{ transformStyle: 'preserve-3d', animationDuration: '8s' }}>
                        {/* File icons orbiting */}
                        {[0, 120, 240].map((angle, i) => (
                            <div
                                key={`file-${i}`}
                                className="absolute top-1/2 left-1/2"
                                style={{
                                    transform: `rotate(${angle}deg) translateX(130px) rotate(-${angle}deg)`,
                                }}
                            >
                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-blue-200 animate-float">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orbit Ring 2 - Video & Processing Icons */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72">
                    <div className="absolute inset-0 animate-spin-slow-reverse" style={{ transformStyle: 'preserve-3d', animationDuration: '12s' }}>
                        {[
                            { Icon: Video, color: 'purple', angle: 0 },
                            { Icon: Brain, color: 'blue', angle: 90 },
                            { Icon: Zap, color: 'yellow', angle: 180 },
                            { Icon: Sparkles, color: 'pink', angle: 270 },
                        ].map(({ Icon, color, angle }, i) => (
                            <div
                                key={`icon-${i}`}
                                className="absolute top-1/2 left-1/2"
                                style={{
                                    transform: `rotate(${angle}deg) translateX(150px) rotate(-${angle}deg)`,
                                }}
                            >
                                <div className={`bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-${color}-200 animate-float`} style={{ animationDelay: `${i * 0.3}s` }}>
                                    <Icon className={`w-5 h-5 text-${color}-600`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outer Glow Ring */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-4 rounded-full border-2 border-purple-300/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                </div>
            </div>

            {/* Message */}
            <p className="text-xl font-medium text-slate-700 animate-pulse">{message}</p>

            {/* Progress dots */}
            <div className="flex gap-2 mt-4">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse linear infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
