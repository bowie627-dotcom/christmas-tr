import React, { Suspense, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { ChristmasScene } from './components/ChristmasScene';
import { Star, Volume2, VolumeX, X, Snowflake } from 'lucide-react';

// 线性圣诞风格顶部装饰图案
const ChristmasLinearPattern = () => (
  <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 opacity-60">
    <path d="M60 2L64 12H56L60 2Z" stroke="#fbbf24" strokeWidth="0.5"/>
    <path d="M20 20C40 20 50 10 60 10C70 10 80 20 100 20" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="2 2"/>
    <circle cx="60" cy="20" r="1.5" fill="#fbbf24" fillOpacity="0.5"/>
    <path d="M10 20H110" stroke="url(#paint0_linear)" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="paint0_linear" x1="10" y1="20" x2="110" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" stopOpacity="0"/>
        <stop offset="0.5" stopColor="#fbbf24"/>
        <stop offset="1" stopColor="#fbbf24" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

// 动态雪花点缀组件
const TwinklingSnowflakes = () => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 16 + 8,
      duration: `${Math.random() * 3 + 2}s`,
      floatDuration: `${Math.random() * 5 + 5}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {snowflakes.map((s) => (
        <div 
          key={s.id}
          className="absolute animate-float"
          style={{ 
            top: s.top, 
            left: s.left, 
            "--float-duration": s.floatDuration 
          } as any}
        >
          <Snowflake 
            size={s.size} 
            className="text-white animate-flicker" 
            style={{ 
              "--duration": s.duration,
              animationDelay: s.delay
            } as any} 
          />
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化背景音乐
  useEffect(() => {
    // 使用本地背景音乐文件
    const audio = new Audio('/audio/background-music.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    bgAudioRef.current = audio;

    return () => {
      audio.pause();
      bgAudioRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (bgAudioRef.current) {
      const newMuteState = !isMuted;
      bgAudioRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
      
      // 处理浏览器自动播放限制：如果还没播放，尝试在切换时播放
      if (!newMuteState) {
        bgAudioRef.current.play().catch(() => console.log("Playback interaction required"));
      }
    }
  }, [isMuted]);

  const handleDiscover = useCallback(() => {
    setIsExploded(true);
    
    // 播放点击反馈音效 (魔法闪烁)
    try {
      // 使用本地点击音效文件
      const sparkleAudio = new Audio('/audio/click-sound.mp3');
      sparkleAudio.volume = 0.6;
      sparkleAudio.play();
    } catch (e) {}

    // 尝试启动背景音乐（如果浏览器之前阻止了）
    if (bgAudioRef.current && !isMuted) {
      bgAudioRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      setShowCard(true);
    }, 1500);
  }, [isMuted]);

  const handleCloseCard = useCallback(() => {
    setShowCard(false);
    setIsExploded(false);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={40} />
        <color attach="background" args={['#000000']} />
        
        <Suspense fallback={null}>
          <ChristmasScene isExploded={isExploded} />
          <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} fade speed={0.5} />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={10} 
          maxDistance={25} 
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 2.5}
          autoRotate={!showCard} 
          autoRotateSpeed={0.8}
          target={[0, 0, 0]}
        />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffd700" />
      </Canvas>

      {/* Music Icon Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 pointer-events-auto shadow-lg ${
            isMuted ? 'bg-red-950/20 border-red-500/20 text-red-400/60' : 'bg-emerald-950/20 border-white/10 text-white/40 hover:text-white'
          }`}
          title={isMuted ? "取消静音" : "静音"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
        </button>
      </div>

      {/* Greeting Card Overlay */}
      {showCard && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-6 animate-in fade-in duration-1000">
          <div className="relative max-w-lg w-full bg-gradient-to-br from-[#064e3b]/95 via-[#2d0a0a]/95 to-[#064e3b]/95 backdrop-blur-3xl border border-amber-500/20 rounded-[3rem] p-8 md:p-14 text-center shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_50px_rgba(251,191,36,0.05)] overflow-hidden animate-in zoom-in duration-700">
            
            <TwinklingSnowflakes />
            
            <button 
              onClick={handleCloseCard}
              className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors pointer-events-auto z-50 p-2"
            >
              <X size={24} />
            </button>
            
            <div className="relative z-10 h-full flex flex-col">
              {/* 顶部线性图案 */}
              <ChristmasLinearPattern />

              {/* 手写线性字体标题 */}
              <h1 className="script-text text-5xl md:text-7xl mb-6 py-2 leading-tight">
                Season's Greetings
              </h1>

              {/* 线性分割线 */}
              <div className="flex items-center justify-center mb-10">
                <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              </div>

              {/* 文字内容区 */}
              <div className="custom-scrollbar space-y-6 text-white/85 leading-relaxed font-light text-base md:text-lg text-center px-4 overflow-y-auto max-h-[45vh] pr-2">
                <p className="text-amber-200/95 font-medium text-xl text-left">尊敬的领导：</p>
                <p className="text-white font-medium">圣诞快乐+新年快乐！</p>
                
                <div className="space-y-5 text-left md:text-center text-sm md:text-base">
                  <p>想到会跟你成为朋友还是觉得很神奇！对我而言你是一个很奇妙的人，总带着一种壮志未酬的少年感以及深深深处的孤独感。</p>
                  <p>虽然对你经历的千刀万剐无法感同身受，但每次听你说起，我总会想到之前听POP MART专访时，王宁说过的：<span className="text-amber-400/90 font-normal">"如果我们相信我们有一天一定会成功，那么我们就希望这故事一定是跌宕起伏的。"</span></p>
                  <p>所以我就祝你能早日达到理想的高度，写出属于你的精彩故事吧！</p>
                </div>

                <div className="py-5 px-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-amber-200/60 text-xs md:text-sm italic">
                    献上我们的授权产品，比奇堡里最能打的蟹老板，希望你喜欢~
                  </p>
                </div>
                
                {/* 签名右对齐 */}
                <div className="pt-8 pb-4 text-right">
                  <p className="text-amber-500/80 text-[10px] tracking-[0.6em] uppercase font-bold">小黄同学 敬上</p>
                </div>
              </div>
              
              <div className="mt-8 border-t border-white/5 h-4 w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Main UI Overlay */}
      {!showCard && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12 px-6">
          <div className="text-center flex flex-col items-center space-y-1 mt-8 md:mt-16 transition-opacity duration-1000" style={{ opacity: isExploded ? 0 : 1 }}>
            <h2 className="heading-text text-2xl md:text-4xl opacity-95">
              Merry Christmas
            </h2>
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1 md:my-2" />
            <h2 className="heading-text text-2xl md:text-4xl opacity-85">
              & Happy New Year
            </h2>
          </div>

          <div className="w-full max-w-xs mb-8 transition-all duration-1000" style={{ transform: isExploded ? 'translateY(100px)' : 'translateY(0)', opacity: isExploded ? 0 : 1 }}>
            <button 
              onClick={handleDiscover}
              className="button-text w-full h-14 bg-emerald-950/40 hover:bg-emerald-900/60 backdrop-blur-xl border border-amber-500/20 rounded-full flex items-center justify-center gap-3 text-white/90 font-medium tracking-[0.25em] text-[10px] md:text-xs pointer-events-auto transition-all duration-500 shadow-[0_10px_40px_-10px_rgba(5,150,105,0.3),0_0_20px_rgba(251,191,36,0.05)] hover:shadow-[0_15px_50px_-5px_rgba(5,150,105,0.4),0_0_30px_rgba(251,191,36,0.1)] active:scale-95 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-none" />
              <Star 
                size={14} 
                className="fill-amber-400 text-amber-400 group-hover:rotate-[72deg] transition-transform duration-700 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
              />
              <span>DISCOVER WISHES</span>
              <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;