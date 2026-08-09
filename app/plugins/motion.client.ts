export default defineNuxtPlugin(({ $router }) => {
  if (!import.meta.client) return

  const installGlassPointer = () => {
    document.querySelectorAll<HTMLElement>('.order-card, .product-card, .glass-card').forEach((element) => {
      element.classList.add('glass-surface')
    })
  }

  const onPointerMove = (event: PointerEvent) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.glass-surface')
    if (!target) return
    const rect = target.getBoundingClientRect()
    target.style.setProperty('--glass-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    target.style.setProperty('--glass-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }

  const onPointerOut = (event: PointerEvent) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.glass-surface')
    target?.style.setProperty('--glass-x', '50%')
    target?.style.setProperty('--glass-y', '18%')
  }

  document.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true })
  installGlassPointer()

  const refresh = () => window.requestAnimationFrame(installGlassPointer)
  $router.afterEach(refresh)
})
