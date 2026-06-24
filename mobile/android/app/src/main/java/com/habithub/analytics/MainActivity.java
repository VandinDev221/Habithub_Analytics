package com.habithub.analytics;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = getBridge().getWebView();
    if (webView == null) return;

    webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
    webView.setVerticalScrollBarEnabled(false);
    webView.setHorizontalScrollBarEnabled(false);
    webView.getSettings().setBuiltInZoomControls(false);
    webView.getSettings().setDisplayZoomControls(false);
    webView.getSettings().setSupportZoom(false);
    webView.getSettings().setTextZoom(100);
  }
}
