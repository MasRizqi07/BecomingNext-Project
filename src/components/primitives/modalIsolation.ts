let openModalLayerCount = 0;
let applicationRootSnapshot: {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
} | null = null;
let bodyOverflowSnapshot: string | null = null;

export function isolateApplicationForModal() {
  const applicationRoot = document.getElementById('main-content');

  if (openModalLayerCount === 0) {
    bodyOverflowSnapshot = document.body.style.overflow;
    applicationRootSnapshot = applicationRoot
      ? {
          element: applicationRoot,
          inert: applicationRoot.inert,
          ariaHidden: applicationRoot.getAttribute('aria-hidden'),
        }
      : null;
  }

  openModalLayerCount += 1;
  document.body.style.overflow = 'hidden';
  if (applicationRoot) {
    applicationRoot.inert = true;
    applicationRoot.setAttribute('aria-hidden', 'true');
  }
}

export function restoreApplicationAfterModal() {
  openModalLayerCount = Math.max(0, openModalLayerCount - 1);
  if (openModalLayerCount > 0) return;

  if (bodyOverflowSnapshot !== null) document.body.style.overflow = bodyOverflowSnapshot;
  bodyOverflowSnapshot = null;

  if (!applicationRootSnapshot) return;
  const {element, inert, ariaHidden} = applicationRootSnapshot;
  element.inert = inert;
  if (ariaHidden === null) element.removeAttribute('aria-hidden');
  else element.setAttribute('aria-hidden', ariaHidden);
  applicationRootSnapshot = null;
}
