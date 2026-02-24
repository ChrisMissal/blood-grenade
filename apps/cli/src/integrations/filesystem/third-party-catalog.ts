export interface ThirdPartyCatalogEntry {
  productName: string;
  category: string;
}

export const THIRD_PARTY_CATALOG: Record<string, ThirdPartyCatalogEntry> = {
  stripe: { productName: "Stripe", category: "payments" },
  paypal: { productName: "PayPal", category: "payments" },
  adyen: { productName: "Adyen", category: "payments" },
  braintree: { productName: "Braintree", category: "payments" },

  "@sentry/node": { productName: "Sentry", category: "observability" },
  sentry: { productName: "Sentry", category: "observability" },
  datadog: { productName: "Datadog", category: "observability" },
  "dd-trace": { productName: "Datadog", category: "observability" },
  "@datadog/browser-rum": { productName: "Datadog", category: "observability" },
  newrelic: { productName: "New Relic", category: "observability" },

  googleanalytics: { productName: "Google Analytics", category: "analytics" },
  "google-analytics": { productName: "Google Analytics", category: "analytics" },
  gtag: { productName: "Google Analytics", category: "analytics" },
  "gtag.js": { productName: "Google Analytics", category: "analytics" },
  "@segment/analytics-node": { productName: "Segment", category: "analytics" },
  "@segment/analytics-next": { productName: "Segment", category: "analytics" },
  segment: { productName: "Segment", category: "analytics" },
  mixpanel: { productName: "Mixpanel", category: "analytics" },
  posthog: { productName: "PostHog", category: "analytics" },
  "@amplitude/analytics-node": { productName: "Amplitude", category: "analytics" },
  chartbeat: { productName: "Chartbeat", category: "media-analytics" },
  parsely: { productName: "Parse.ly", category: "media-analytics" },

  auth0: { productName: "Auth0", category: "identity" },
  "@okta/okta-sdk-nodejs": { productName: "Okta", category: "identity" },

  twilio: { productName: "Twilio", category: "messaging" },
  "@sendgrid/mail": { productName: "SendGrid", category: "email" },
  mailchimp: { productName: "Mailchimp", category: "email-marketing" },
  klaviyo: { productName: "Klaviyo", category: "email-marketing" },
  braze: { productName: "Braze", category: "customer-engagement" },

  "@slack/web-api": { productName: "Slack", category: "collaboration" },
  zendesk: { productName: "Zendesk", category: "support" },
  intercom: { productName: "Intercom", category: "support" },

  "launchdarkly-node-server-sdk": { productName: "LaunchDarkly", category: "feature-flags" },
  launchdarkly: { productName: "LaunchDarkly", category: "feature-flags" },
  optimizely: { productName: "Optimizely", category: "experimentation" },

  wordpress: { productName: "WordPress", category: "cms" },
  contentful: { productName: "Contentful", category: "cms" },
  strapi: { productName: "Strapi", category: "cms" },
  sanity: { productName: "Sanity", category: "cms" },
  prismic: { productName: "Prismic", category: "cms" },
  drupal: { productName: "Drupal", category: "cms" },
  ghost: { productName: "Ghost", category: "cms" },
  aem: { productName: "Adobe Experience Manager", category: "cms" },
  "adobe-experience-manager": { productName: "Adobe Experience Manager", category: "cms" },

  "google-ad-manager": { productName: "Google Ad Manager", category: "ad-tech" },
  "google-admanager": { productName: "Google Ad Manager", category: "ad-tech" },
  admanager: { productName: "Google Ad Manager", category: "ad-tech" },
  "google-ads": { productName: "Google Ads", category: "ad-tech" },
  adsense: { productName: "Google AdSense", category: "ad-tech" },
  "amazon-publisher-services": { productName: "Amazon Publisher Services", category: "ad-tech" },
  prebid: { productName: "Prebid", category: "ad-tech" },
  prebidjs: { productName: "Prebid", category: "ad-tech" },
  "the-trade-desk": { productName: "The Trade Desk", category: "ad-tech" },
  "xandr-monetize": { productName: "Xandr Monetize", category: "ad-tech" },
  pubmatic: { productName: "PubMatic", category: "ad-tech" },
  openx: { productName: "OpenX", category: "ad-tech" },
  magnite: { productName: "Magnite", category: "ad-tech" },
  outbrain: { productName: "Outbrain", category: "content-discovery" },
  taboola: { productName: "Taboola", category: "content-discovery" },

  piano: { productName: "Piano", category: "paywall-subscriptions" },
  zephr: { productName: "Zephr", category: "paywall-subscriptions" },
  "zuora": { productName: "Zuora", category: "subscriptions-billing" },
  chargebee: { productName: "Chargebee", category: "subscriptions-billing" },
  recharge: { productName: "Recharge", category: "subscriptions-billing" },

  printiq: { productName: "PrintIQ", category: "print-production" },
  presswise: { productName: "PressWise", category: "print-production" },
  quarkxpress: { productName: "QuarkXPress", category: "print-layout" },
  "adobe-indesign-server": { productName: "Adobe InDesign Server", category: "print-layout" },
  apryse: { productName: "Apryse", category: "document-rendering" },
  pdftron: { productName: "PDFTron", category: "document-rendering" },
};
