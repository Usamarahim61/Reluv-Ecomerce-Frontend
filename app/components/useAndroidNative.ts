"use client";

import { useLayoutEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export function useAndroidNative() {
  const [isReady, setIsReady] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const native = Capacitor.isNativePlatform();
    const android = native && Capacitor.getPlatform() === "android" || html.classList.contains('android-native');
    setIsAndroid(android);
    // Delay ready by 3 seconds for beautiful splash
    setTimeout(() => {
      setIsReady(true);
    }, 3000);
  }, []);

  return { isAndroid, isReady };
}
