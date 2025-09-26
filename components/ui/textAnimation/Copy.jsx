'use client'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Register plugins in the correct order
gsap.registerPlugin(SplitText)

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0.5,
}) {
  const containerRef = useRef(null)
  const elementRef = useRef([])
  const splitRef = useRef([])
  const lines = useRef([])

  useGSAP(
    () => {
      if (!containerRef.current) return

      // Clear previous references
      splitRef.current = []
      elementRef.current = []
      lines.current = []

      let elements = []
      if (containerRef.current.hasAttribute('data-copy-wrapper')) {
        elements = Array.from(containerRef.current.children)
      } else {
        elements = [containerRef.current]
      }

      elements.forEach((element) => {
        elementRef.current.push(element)

        const split = SplitText.create(element, {
          type: 'lines',
          linesClass: 'line',
        })

        splitRef.current.push(split)

        const computedStyle = window.getComputedStyle(element)
        const textIndent = computedStyle.textIndent

        if (textIndent && textIndent !== '0px') {
          if (split.lines.length > 0) {
            split.lines[0].style.paddingLeft = textIndent
          }
          element.style.textIndent = '0'
        }

        lines.current.push(...split.lines)
      })

      // Set initial state
      gsap.set(lines.current, {
        y: '100%',
        opacity: 0,
      })

      const animationProps = {
        y: '0%',
        opacity: 1,
        stagger: 0.1,
        ease: 'power4.out',
        delay: delay,
      }

      if (animateOnScroll) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            once: true,
          },
        })
      } else {
        gsap.to(lines.current, {
          ...animationProps,
        })
      }

      return () => {
        splitRef.current.forEach((split) => {
          if (split) {
            split.revert()
          }
        })
      }
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay],
    }
  )

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef })
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  )
}
