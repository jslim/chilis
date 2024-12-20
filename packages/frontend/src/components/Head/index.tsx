import type { FC } from 'react'

import { memo } from 'react'
import NextHead from 'next/head'
import { useRouter } from 'next/router'

import config from '@/data/config.json'

import { ensureHttps, fixSlashes, prefix } from '@/utils/basic-functions'

import { MockContentSecurityPolicy } from './MockContentSecurityPolicy'
import { MockFeaturePolicy } from './MockFeaturePolicy'

const dev = process.env.NODE_ENV === 'development'
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || ''

export type HeadProps = {
  title: string
  image?: string
  siteName?: string
  description?: string
  descriptionSocial?: string
}

export const Head: FC<HeadProps> = memo(({ title, description, descriptionSocial, siteName, image }) => {
  const router = useRouter()

  // Next.js is not including assetPrefix during build time
  const fixedAsPath =
    typeof window === 'undefined'
      ? fixSlashes(`/${assetPrefix}/${router.asPath.split('?')[0].split('#')[0]}`)
      : router.asPath

  const fullPath = ensureHttps(
    fixSlashes(`${process.env.NEXT_PUBLIC_WEBSITE_SITE_URL}/${fixedAsPath}`, true).split('?')[0].split('#')[0]
  )

  const shareImage = `${fullPath}${image}`
  const shareLocale = 'en_US'

  return (
    <NextHead>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5, shrink-to-fit=no, viewport-fit=cover"
      />

      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Favicons - generate favicons in https://realfavicongenerator.net */}
      <link rel="icon" type="image/png" sizes="16x16" href={prefix('/common/favicons/favicon-16x16.png')} />
      <link rel="icon" type="image/png" sizes="32x32" href={prefix('/common/favicons/favicon-32x32.png')} />
      <link rel="icon" type="image/png" sizes="144x144" href={prefix('/common/favicons/favicon-144x144.png')} />
      <link rel="apple-touch-icon" sizes="180x180" href={prefix('/common/favicons/apple-touch-icon.png')} />
      <link rel="shortcut icon" href={prefix('/common/favicons/favicon.ico')} />
      <link rel="mask-icon" href={prefix('/common/favicons/safari-pinned-tab.svg')} color="#000" />
      {!dev ? (
        <link rel="manifest" href={prefix('/common/favicons/site.webmanifest')} crossOrigin="use-credentials" />
      ) : null}
      <meta name="theme-color" content="#1c1c1c" />

      {/* Share meta tags */}
      <meta property="og:url" content={fullPath} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={shareImage} />
      <meta property="og:locale" content={shareLocale} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:description" content={descriptionSocial} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:image" content={shareImage} />
      <meta name="twitter:description" content={descriptionSocial} />

      {/* Other recommends */}
      <link rel="canonical" href={fullPath} />

      {/* Env dependent */}
      {config.dnsPrefetch[process.env.NODE_ENV].map((href: string) => (
        <>
          <link key={href} rel="preconnect" href={href} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={href} />
        </>
      ))}

      {process.env.NODE_ENV === 'development' && (
        <>
          <MockFeaturePolicy />
          <MockContentSecurityPolicy />
        </>
      )}
    </NextHead>
  )
})

Head.displayName = 'Head'
