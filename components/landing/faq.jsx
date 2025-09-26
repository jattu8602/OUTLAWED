import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const FAQSection = () => {
  const faqData = [
    {
      question: 'What is Outlawed?',
      answer:
        'Outlawed is a smart CLAT preparation platform offering free and paid mock tests, learning modules, analytics, and community features to help aspirants crack their exams.',
    },
    {
      question: 'Are the tests free?',
      answer:
        'Yes! Outlawed offers free mock tests to get you started. You can later upgrade to unlock unlimited premium tests, advanced analytics, and leaderboard access.',
    },
    {
      question: 'What do I get with the paid plan?',
      answer: (
        <ul className="list-disc ml-6 space-y-1">
          <li>Unlimited full-length mock tests</li>
          <li>Sectional & topic-wise practice</li>
          <li>Detailed performance analytics</li>
          <li>Advanced profile & progress tracking</li>
          <li>Leaderboard competition</li>
          <li>Priority notifications and updates</li>
        </ul>
      ),
    },
    {
      question: 'Do I need to create an account?',
      answer:
        'Yes, creating an account allows us to save your progress, track your analytics, and recommend the right learning modules for you.',
    },
    {
      question: 'Is there any registration fee?',
      answer:
        'No upfront registration fee. You can start for free. Paid subscriptions are optional if you want premium features.',
    },
    {
      question: 'How is Outlawed different from other CLAT platforms?',
      answer:
        'We focus on affordability, simplicity, and effectiveness. Our platform combines mock tests, learning modules, advanced analytics, and a smooth test-taking UI that keeps you focused.',
    },
    {
      question: 'Do you provide learning material?',
      answer:
        'Yes, Outlawed offers curated learning modules for CLAT aspirants. These include GK, Legal, English, and Logical Reasoning practice.',
    },
    {
      question: 'Will my progress be saved?',
      answer:
        'Absolutely! Your profile keeps track of all your tests, scores, time analysis, and improvements over time.',
    },
    {
      question: 'How do I stay updated about new tests?',
      answer:
        'Outlawed sends smart notifications for new tests, performance reports, and leaderboard updates so you never miss a chance to improve.',
    },
  ]

  return (
    <div className="bg-[#141414] text-[#fcf2e8] py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto mt-14">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-4xl px-10 sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#fcf2e8] mb-4 sm:mb-6">
            Outlawed FAQ
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#ccc] max-w-3xl mx-auto px-2">
            Everything you need to know about Outlawed — your CLAT preparation
            companion.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <Accordion
            type="single"
            collapsible
            className="space-y-3 sm:space-y-4"
          >
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#fcf2e8] text-[#141414] rounded-lg sm:rounded-xl border border-[#141414]/10 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-[#141414] hover:text-[#141414]/80 transition-colors text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="text-[#141414]/80 leading-relaxed font-medium text-sm sm:text-base">
                    {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 sm:mt-16 px-2 sm:px-4">
          <div className="bg-[#fcf2e8] text-[#141414] rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-[#141414]/10 sm:mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-[#141414] mb-3 sm:mb-4">
              Still have questions?
            </h3>
            <p className="text-[#141414]/80 mb-4 sm:mb-6 font-medium text-sm sm:text-base">
              We’re here to help! Reach out to our team and we’ll get back to
              you quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=daksh.madhyam@gmail.com"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#141414] text-[#fcf2e8] rounded-lg font-medium hover:bg-[#141414]/90 transition-colors text-sm sm:text-base"
              >
                Email Us
              </a>
              <a
                href="https://www.instagram.com/daksh.madhyam/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-[#141414] text-[#141414] rounded-lg font-medium hover:bg-[#141414] hover:text-[#fcf2e8] transition-colors text-sm sm:text-base"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQSection
