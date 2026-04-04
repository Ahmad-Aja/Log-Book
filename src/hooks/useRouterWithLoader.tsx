import NProgress from 'nprogress'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'

export function useRouterWithLoader(): AppRouterInstance {
  const handleStart = () => NProgress.start()

  const router = useRouter()

  return {
    back: () => {
      handleStart()
      return router.back()
    },
    forward: () => {
      handleStart()
      return router.forward()
    },

    prefetch: (href, options) => {
      handleStart()
      return router.prefetch(href, options)
    },
    push: (href, options) => {
      handleStart()
      return router.push(href, options)
    },
    refresh: () => {
      handleStart()
      return router.refresh()
    },
    replace: (href, options) => {
      handleStart()
      return router.replace(href, options)
    }
  }
}
