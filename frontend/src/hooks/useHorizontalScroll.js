import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to enable smooth mouse-wheel horizontal scrolling,
 * click-and-drag panning, and left/right scroll navigation arrows.
 */
export function useHorizontalScroll() {
  const elRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const checkScroll = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    checkScroll();

    // 1. Mouse wheel handler: translate vertical deltaY to horizontal scrollLeft
    const onWheel = (e) => {
      // Touchpad horizontal swipe already emits deltaX
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;

      const isScrollingRight = e.deltaY > 0;
      const isScrollingLeft = e.deltaY < 0;

      const canRight = scrollLeft < maxScroll - 1;
      const canLeft = scrollLeft > 1;

      if ((isScrollingRight && canRight) || (isScrollingLeft && canLeft)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
        checkScroll();
      }
    };

    // 2. Drag-to-scroll with mouse
    let isDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let hasDragged = false;

    const onMouseDown = (e) => {
      if (e.button !== 0) return; // Only main left button
      isDown = true;
      setIsDragging(true);
      startX = e.pageX - el.offsetLeft;
      initialScrollLeft = el.scrollLeft;
      hasDragged = false;
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.3;
      if (Math.abs(walk) > 5) {
        hasDragged = true;
      }
      el.scrollLeft = initialScrollLeft - walk;
      checkScroll();
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        setIsDragging(false);
      }
    };

    const onClickCapture = (e) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        hasDragged = false;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction) => {
    const el = elRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.6, 200);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 350);
  };

  return { elRef, canScrollLeft, canScrollRight, isDragging, scroll, checkScroll };
}
