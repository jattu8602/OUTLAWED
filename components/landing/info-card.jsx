"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

const RoundCard = ({
  title,
  subtitle,
  description,
  icon,
  index,
  bgColor,
}) => {
  return (
    <div
      className="round-card relative w-full text-[#141414] rounded-2xl p-8 flex flex-col justify-between h-[500px] md:h-[350px]"
      style={{ backgroundColor: bgColor }}
    >
      {/* Round Icon - Emoji representation of the round type */}
      <div className="text-5xl mb-4">{icon}</div>

      {/* Card Content Container */}
      <div className="flex-1">
        {/* Round Badge - Shows "Round 1" or "Round 2" */}
        <div className="mb-3">
          <span className="inline-block bg-[#141414] text-[#fcf2e8] px-3 py-1 rounded-full text-sm font-medium">
            Feature {index + 1}
          </span>
        </div>

        {/* Round Title - Main heading for the round */}
        <h2 className="text-2xl font-black leading-tight mb-3">{title}</h2>

        {/* Round Subtitle - Secondary description */}
        <p className="text-lg font-semibold text-[#666] mb-4">{subtitle}</p>

        {/* Round Description - Detailed explanation */}
        <p className="text-base font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// ============================================================================
// SIMPLE CARD COMPONENT - Basic card with title, copy, and icon
// ============================================================================
const Card = ({ title, copy, index }) => {
  return (
    <div
      className="card relative h-[260px] text-[#141414] w-full"
      id={`card-${index + 1}`}
    >
      <div className="info-card-inner relative will-change-transform w-full h-full p-[2em] flex flex-col gap-[0.5rem] rounded-xl">
        <div className="card-content flex flex-col justify-between text-left h-full">
          <div className="flex items-start gap-[1em]">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-start">
              <img
                className="w-6 h-6 object-contain"
                src={`/icons/icon_${index}.svg`}
                alt={`icon-${index}`}
              />
            </div>
            <h3 className="text-[2.5rem] font-semibold leading-none">
              {title}
            </h3>
          </div>
          <p className="text-[1rem] font-medium text-left">{copy}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SIMPLE REWARDS SECTION COMPONENT - No animations, mobile-friendly
// ============================================================================
const SimpleRewardsSection = () => {
 const rewards = [
   {
     title: '📘 Learning Modules',
     copy: 'Access structured free learning modules covering essential topics to get you started.',
     index: 1,
   },
   {
     title: '📝 Smooth Test Experience',
     copy: 'Take free tests with a clean and distraction-free UI designed for focus.',
     index: 2,
   },
   {
     title: '⭐ Advanced Profile',
     copy: 'Unlock detailed progress analytics, badges, and personalized recommendations.',
     index: 3,
   },
   {
     title: '🔔 Smart Notifications',
     copy: 'Stay on track with reminders, new test alerts, and performance updates.',
     index: 4,
   },
   {
     title: '🏆 Leaderboard',
     copy: 'Compete with peers, climb the ranks, and showcase your preparation journey.',
     index: 5,
   },
 ]


  return (
    <div className="bg-[#141414] text-[#fcf2e8] py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl sm:text-5xl md:text-2xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black leading-relaxed sm:leading-tight md:leading-tight lg:leading-tight mb-6">
            What You Get
          </h2>
          <p className="text-lg md:text-xl text-[#ccc] max-w-3xl mx-auto">
            Discover the amazing rewards and benefits waiting for you at
            Hackwave.
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="card relative h-[300px] text-[#141414] w-full bg-[#fcf2e8] rounded-xl"
              id={`card-${index + 2}`}
            >
              <div className="info-card-inner relative will-change-transform w-full h-full p-[2em] flex flex-col gap-[0.5rem] rounded-xl">
                <div className="card-content flex flex-col justify-between text-left h-full">
                  <div className="flex items-start gap-[1em]">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        className="w-6 h-6 object-contain"
                        src={`/icons/icon_${reward.index}.png`}
                        alt={`icon-${reward.index}`}
                      />
                    </div>
                    <h3 className="text-[2.5rem] font-semibold leading-none">
                      {reward.title}
                    </h3>
                  </div>
                  <p className="text-[1.3rem] font-medium text-left">
                    {reward.copy}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        {/* <div className="text-center mt-16">
          <div className="text-6xl md:text-7xl mb-6">🧑‍💻</div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
            Ready to <span className="text-[#feaac0]">Claim Your Rewards</span>?
          </h3>
          <p className="text-lg md:text-xl text-[#ccc]">
            Join the ultimate hackathon experience today!
          </p>
        </div> */}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN INFO CARD COMPONENT - How It Works section with animated cards
// ============================================================================
export default function InfoCard() {
  // ============================================================================
  // STATE & REFS - Client-side rendering and animation references
  // ============================================================================
  const [isClient, setIsClient] = useState(false); // Ensure GSAP runs only on client
  const heroRef = useRef(null); // Reference to the pinned hero section
  const rewardsRef = useRef(null); // Reference to the rewards section for pinning
  const cardRefs = useRef([]); // Array of hero card element references
  const rewardsCardRefs = useRef([]); // Array of rewards card element references

  // ============================================================================
  // CLIENT-SIDE INITIALIZATION - Set client flag for GSAP compatibility
  // ============================================================================
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ============================================================================
  // ANIMATION SETUP - GSAP ScrollTrigger configuration and card animations
  // ============================================================================
  useEffect(() => {
    if (!isClient) return; // Wait for client-side rendering

    const initAnimation = () => {
      console.log("Initializing InfoCard hero animation...");

      // ============================================================================
      // PHASE 1: INITIAL CARD POSITIONS - Set cards below viewport (100% y)
      // ============================================================================
      // Set initial positions for all cards - they start below the viewport
      // This creates the effect of cards sliding up from below during scroll
      cardRefs.current.forEach((card) => {
        if (card) {
          gsap.set(card, {
            y: "100%", // Position cards 100% below their container
          });
        }
      });
      rewardsCardRefs.current.forEach((card) => {
        if (card) {
          gsap.set(card, {
            y: "300%", // Position rewards cards 100% below their container
          });
        }
      });
      console.log("Rewards section entered - Cards set to 100% y position");
      // ============================================================================
      // PHASE 2: SCROLL TRIGGER CONFIGURATION - Pin section and control animations
      // ============================================================================
      if (heroRef.current) {
        ScrollTrigger.create({
          trigger: heroRef.current, // Element that triggers the animation
          pin: true, // Pin the hero section during scroll
          start: "top top", // Start pinning when top of hero hits top of viewport
          end: `+=${window.innerHeight * 2}`, // 4 viewport heights of scroll space
          pinSpacing: true, // Maintain scroll space for pinned element
          markers: false, // Disable debug markers in production
          onUpdate: (self) => {
            const progress = self.progress; // Scroll progress from 0 to 1

            // ============================================================================
            // PHASE 3: CARD ANIMATION LOGIC - Two-phase card movement
            // ============================================================================
            if (cardRefs.current[0] && cardRefs.current[1]) {
              const firstCard = cardRefs.current[0]; // Round 1 card reference
              const secondCard = cardRefs.current[1]; // Round 2 card reference

              // ============================================================================
              // RESPONSIVE POSITIONING - Adjust for mobile vs desktop
              // ============================================================================
              const isMobile = window.innerWidth < 768; // Mobile breakpoint check
              const mobileOffset = isMobile ? 10 : 0; // 10% higher positioning on mobile

              // ============================================================================
              // FIRST CARD ANIMATION - Slides up from bottom to center position
              // ============================================================================
              if (progress <= 0.5) {
                // Phase 1: First card moves from 100% to target position (0-50% scroll)
                const firstCardProgress = progress / 0.5; // Normalize progress to 0-1
                const targetY = 40 - mobileOffset; // Target: 30% on mobile, 40% on desktop
                gsap.set(firstCard, {
                  y: `${100 - (100 - targetY) * firstCardProgress}%`, // Smooth interpolation
                });
              } else {
                // Phase 2: First card stays at target position (50-100% scroll)
                gsap.set(firstCard, {
                  y: `${40 - mobileOffset}%`, // Maintain final position
                });
              }

              // ============================================================================
              // SECOND CARD ANIMATION - Slides up to cover first card
              // ============================================================================
              if (progress >= 0.5) {
                // Phase 2: Second card moves from 150% to same position as first (50-100% scroll)
                const secondCardProgress = (progress - 0.5) / 0.5; // Normalize progress to 0-1
                const targetY = 40 - mobileOffset; // Same target as first card
                gsap.set(secondCard, {
                  y: `${150 - (150 - targetY) * secondCardProgress}%`, // Smooth interpolation from 150% to targetY
                });
              } else {
                // Phase 1: Second card stays below viewport (0-50% scroll)
                gsap.set(secondCard, {
                  y: "150%", // Keep hidden below viewport
                });
              }
            }
          },
        });
      }

      // ============================================================================
      // PHASE 4: REWARDS SECTION PINNING - Pin the "What You Get" section
      // ============================================================================
      if (rewardsRef.current) {
        ScrollTrigger.create({
          trigger: rewardsRef.current, // Element that triggers the pinning
          pin: true, // Pin the rewards section during scroll
          start: "top top", // Start pinning when top of rewards hits top of viewport
          end: `+=${window.innerHeight * 3}`, // 3 viewport heights of scroll space (increased from 2)
          pinSpacing: true, // Maintain scroll space for pinned element
          markers: false, // Disable debug markers in production
          onEnter: () => {
            // ============================================================================
            // REWARDS SECTION ENTRY - Set rewards cards to 300% y position
            // ============================================================================
            // When we enter the rewards section, set all rewards cards to 300% y position
            // This creates a starting point for building animations from this section
            console.log(
              "Rewards section entered - Rewards cards set to 300% y position"
            );
          },
          onUpdate: (self) => {
            // ============================================================================
            // REWARDS SECTION SCROLL ANIMATION - Progressive card reveals
            // ============================================================================
            const progress = self.progress; // Scroll progress from 0 to 1

            // Animate each rewards card with staggered timing
            rewardsCardRefs.current.forEach((card, index) => {
              if (card) {
                // Calculate individual card progress with staggered delay
                const cardDelay = index * 0.12; // Each card starts 12% later (reduced from 15%)
                const cardProgress = Math.max(
                  0,
                  Math.min(1, (progress - cardDelay) / 0.25)
                ); // 25% duration per card (reduced from 30%)

                if (cardProgress > 0) {
                  // Animate card from 300% to 0% (slide up into view)
                  gsap.set(card, {
                    y: `${300 - 300 * cardProgress}%`, // Smooth interpolation from 300% to 0%
                  });
                } else {
                  // Keep card at 300% until its turn
                  gsap.set(card, {
                    y: "300%",
                  });
                }
              }
            });
          },
        });
      }
    };

    // ============================================================================
    // ANIMATION INITIALIZATION - Delay to ensure DOM is ready
    // ============================================================================
    const timer = setTimeout(initAnimation, 1000); // 1 second delay for DOM stability

    // ============================================================================
    // CLEANUP - Remove all ScrollTriggers on component unmount
    // ============================================================================
    return () => {
      clearTimeout(timer); // Clear initialization timer
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); // Kill all triggers
    };
  }, [isClient]);

  // ============================================================================
  // ROUND DATA - Competition structure and content for each round
  // ============================================================================
 const rounds = [
   {
     title: 'Free Tests',
     subtitle: 'Get started without any cost',
     description: `
      • Access limited mock tests
      • Basic performance analysis
      • Limited question types (MCQs only)
      • Practice mode available
      • Community discussions unlocked
    `,
     icon: '🆓', // Free icon
     bgColor: '#d4f8e8', // Soft green for free
   },
   {
     title: 'Paid Tests',
     subtitle: 'Unlock premium features',
     description: `
      • All Free Test features
      • Unlimited full-length mocks
      • Sectional & topic-wise tests
      • Detailed performance analytics (time tracking, accuracy, percentile)
      • Adaptive difficulty questions
      • Priority support & doubt solving
      • Exclusive leaderboard rankings
      • Access to curated GK/Legal/Current Affairs material
    `,
     icon: '💎', // Premium diamond icon
     bgColor: '#ffe4b5', // Warm premium orange/yellow
   },
 ]


  // ============================================================================
  // CLIENT-SIDE RENDERING CHECK - Return null until client is ready
  // ============================================================================
  if (!isClient) {
    return null; // Prevent hydration mismatch with GSAP
  }

  // ============================================================================
  // COMPONENT RENDER - Main layout with hero and outro sections
  // ============================================================================
  return (
    <div className="bg-[#141414] text-[#fcf2e8]">
      {/* ============================================================================
          HERO SECTION - Pinned section with animated cards
          ============================================================================ */}
      <div
        ref={heroRef} // GSAP ScrollTrigger target
        className="hidden md:block relative w-screen h-screen p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden"
      >
        {/* Main content container with centered layout */}
        <div className="w-full h-full flex flex-col justify-start md:justify-center items-center pt-12 md:pt-0 p-3 sm:p-4 md:p-6 lg:p-8 relative">
          {/* ============================================================================
              SECTION TITLE - Always visible and centered
              ============================================================================ */}
          <h1 className="w-full text-center max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] text-[#fcf2e8] text-5xl sm:text-5xl md:text-2xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black leading-relaxed sm:leading-tight md:leading-tight lg:leading-tight px-2 sm:px-4 z-10 mb-4 sm:mb-6 md:mb-8">
            How It Works
          </h1>

          {/* ============================================================================
              DESCRIPTION TEXT - Gets covered by sliding cards during animation
              ============================================================================ */}
          <div className="max-w-4xl z-5 mb-4 sm:mb-6 md:mb-8">
            <p className="text-[#ccc] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border border-dashed border-[rgb(60,60,60)] p-4 sm:p-6 md:p-8 lg:p-10 mt-10">
              Free and paid mock tests designed to test your skills, accuracy,
              and speed. With detailed analytics, prove you have what it takes
              to crack CLAT with confidence.
            </p>
          </div>

          {/* ============================================================================
              ANIMATED CARDS CONTAINER - Absolute positioning for GSAP control
              ============================================================================ */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Card wrapper with responsive height and max-width constraints */}
            <div className="relative w-full max-w-4xl h-[130vh] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] z-20">
              {/* Map through rounds data to create animated cards */}
              {rounds.map((round, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    cardRefs.current[index] = el // Store reference for GSAP animation
                  }}
                  className="absolute inset-0 gap-x-5" // Full container positioning for GSAP
                >
                  <RoundCard {...round} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Static stacked cards */}
      <div className="md:hidden px-4 py-12">
        <h1 className="text-center text-4xl font-black mb-6">How It Works</h1>
        <p className="text-[#ccc] text-base font-medium leading-relaxed mb-8">
          Free and paid mock tests designed to test your skills, accuracy, and
          speed. With detailed analytics, prove you have what it takes to crack
          CLAT with confidence.
        </p>

        <div className="flex flex-col gap-6">
          {rounds.map((round, index) => (
            <RoundCard key={index} {...round} index={index} />
          ))}
        </div>
      </div>

      {/* ============================================================================
          WHAT YOU GET SECTION - Rewards and benefits showcase
          ============================================================================ */}

      {/* Desktop: Animated rewards section */}
      <div
        ref={rewardsRef} // GSAP ScrollTrigger target for pinning
        className="hidden relative w-screen min-h-screen md:flex flex-col items-center justify-center"
      >
        <div className="text-center w-full">
          {/* ============================================================================
              SECTION HEADER - Main title and description
              ============================================================================ */}
          <div className="px-4 sm:px-6 md:px-8 h-screen flex flex-col justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6 sm:mt-72 md:mt-10">
              {/* Heading Card */}
              <div
                className="card relative h-[260px] text-[#141414] w-full py-8"
                id={`card-1`}
              >
                <div className="info-card-inner relative will-change-transform w-full h-full p-[2em] flex flex-col gap-[0.5rem]">
                  <div className="card-content flex flex-col text-left w-[80%]">
                    <h1 className="text-[3rem] font-semibold leading-none mb-[1.5em] md:mb-[1rem]">
                      Why Choose Outlawed?
                    </h1>
                  </div>
                  <p className="text-[1.05rem] font-medium text-left">
                    Unlock free and premium features that enhance your test prep
                    experience.
                  </p>
                </div>
              </div>

              {/* Free Feature – Learning Modules */}
              <div ref={(el) => (rewardsCardRefs.current[1] = el)}>
                <Card
                  title="📘 Learning Modules"
                  copy="Access structured free learning modules covering essential topics to get you started."
                  index={1}
                />
              </div>

              {/* Free Feature – Nice Test Experience */}
              <div ref={(el) => (rewardsCardRefs.current[2] = el)}>
                <Card
                  title="📝 Smooth Test Experience"
                  copy="Take free tests with a clean and distraction-free UI designed for focus."
                  index={2}
                />
              </div>

              {/* Paid Feature – Advanced Profile */}
              <div ref={(el) => (rewardsCardRefs.current[3] = el)}>
                <Card
                  title="⭐ Advanced Profile"
                  copy="Unlock detailed progress analytics, badges, and personalized recommendations."
                  index={3}
                />
              </div>

              {/* Paid Feature – Notifications */}
              <div ref={(el) => (rewardsCardRefs.current[4] = el)}>
                <Card
                  title="🔔 Smart Notifications"
                  copy="Stay on track with reminders, new test alerts, and performance updates."
                  index={4}
                />
              </div>

              {/* Paid Feature – Leaderboard */}
              <div ref={(el) => (rewardsCardRefs.current[5] = el)}>
                <Card
                  title="🏆 Leaderboard"
                  copy="Compete with peers, climb the ranks, and showcase your preparation journey."
                  index={5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Simple rewards section without animations */}
      <div className="md:hidden">
        <SimpleRewardsSection />
      </div>
    </div>
  )
}
