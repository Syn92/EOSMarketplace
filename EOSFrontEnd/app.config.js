import 'dotenv/config'

export default {
  expo: {
    name: "EOSFrontEnd",
    slug: "EOSFrontEnd",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    facebookScheme: 'fb' + process.env.FB_APP_ID,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      "bundleIdentifier":"com.jebouas.EOSFrontEnd",
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      "softwareKeyboardLayoutMode": "pan"
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      iosClient: process.env.IOS_CLIENT,
      andClient: process.env.AND_CLIENT,
      fbAppId: process.env.FB_APP_ID,
      apiKeyMoonpayTest: process.env.API_KEY_MOONPAY_TEST,
      color: process.env.COLORFONT,
      onlyGateways: process.env.ONLYGATEWAYS,
      onlyCryptos: process.env.ONLYCRYPTOS,
      onlyFiat: process.env.ONLYFIAT
    }
  }
}
