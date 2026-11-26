package com.raavankingx.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Build;
import android.os.Environment;
import android.os.Message;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.Locale;

/** Real top-level WebView, not an iframe: no address bar and no automatic external browser. */
public class WebViewActivity extends Activity {
    private static final int BACKGROUND = Color.rgb(7, 11, 18);
    private static final int HEADER = Color.rgb(7, 22, 43);
    private static final int FOREGROUND = Color.rgb(248, 250, 252);
    private WebView web;
    private FrameLayout content;
    private LinearLayout root;
    private ProgressBar progress;
    private Button back, forward;
    private String initialUrl;
    private final ArrayList<String> allowed = new ArrayList<>();
    private ValueCallback<Uri[]> fileCallback;
    private View fullscreen;
    private WebChromeClient.CustomViewCallback fullscreenCallback;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        WebView.setWebContentsDebuggingEnabled(false);
        initialUrl = getIntent().getStringExtra("url");
        if (initialUrl == null || !"https".equals(Uri.parse(initialUrl).getScheme())) { finish(); return; }
        try {
            JSONArray domains = new JSONArray(getIntent().getStringExtra("allowedDomains") == null ? "[]" : getIntent().getStringExtra("allowedDomains"));
            for (int i = 0; i < domains.length(); i++) allowed.add(domains.getString(i).toLowerCase(Locale.ROOT));
        } catch (Exception ignored) { }
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BACKGROUND);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setGravity(android.view.Gravity.CENTER_VERTICAL);
        toolbar.setBackgroundColor(HEADER);
        back = tool(toolbar, "‹", "Back", () -> { if (web.canGoBack()) web.goBack(); else finish(); });
        forward = tool(toolbar, "›", "Forward", () -> { if (web.canGoForward()) web.goForward(); });
        tool(toolbar, "↻", "Refresh", () -> web.reload());
        TextView brand = new TextView(this);
        brand.setText("RAAVANKINGX");
        brand.setTextColor(FOREGROUND);
        brand.setTextSize(13);
        brand.setSingleLine(true);
        brand.setEllipsize(android.text.TextUtils.TruncateAt.END);
        brand.setTypeface(null, android.graphics.Typeface.BOLD);
        toolbar.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));
        tool(toolbar, "⌂", "Home", this::finish);
        tool(toolbar, "×", "Close", this::finish);
        root.addView(toolbar, new LinearLayout.LayoutParams(-1, dp(52)));
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        root.addView(progress, new LinearLayout.LayoutParams(-1, dp(3)));
        content = new FrameLayout(this);
        root.addView(content, new LinearLayout.LayoutParams(-1, 0, 1));
        web = new WebView(this);
        content.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return intercept(request.getUrl());
            }
            @Override public void onPageFinished(WebView view, String url) {
                back.setEnabled(view.canGoBack()); forward.setEnabled(view.canGoForward());
                CookieManager.getInstance().flush();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel(); showError("This website's secure connection could not be verified.");
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showError("This website could not load. Check your connection or use a public website link.");
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value); progress.setVisibility(value == 100 ? View.INVISIBLE : View.VISIBLE);
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try { startActivityForResult(params.createIntent(), 42); return true; }
                catch (Exception error) { fileCallback = null; return false; }
            }
            @Override public boolean onCreateWindow(WebView view, boolean dialog, boolean gesture, Message message) {
                if (!gesture) return false;
                WebView child = new WebView(WebViewActivity.this);
                child.setWebViewClient(new WebViewClient() {
                    @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                        if (!intercept(req.getUrl())) web.loadUrl(req.getUrl().toString());
                        v.destroy(); return true;
                    }
                });
                ((WebView.WebViewTransport) message.obj).setWebView(child);
                message.sendToTarget(); return true;
            }
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreen != null) { callback.onCustomViewHidden(); return; }
                fullscreen = view; fullscreenCallback = callback;
                content.addView(view, new FrameLayout.LayoutParams(-1, -1));
            }
            @Override public void onHideCustomView() { hideFullscreen(); }
        });
        web.setDownloadListener((url, agent, disposition, mime, length) -> download(url, agent, disposition, mime));
        web.loadUrl(initialUrl);
    }

    private boolean intercept(Uri uri) {
        if (!"https".equals(uri.getScheme())) {
            new AlertDialog.Builder(this).setTitle("External action required")
                .setMessage("This link requires another installed app. RaavanKingX will not open it automatically.")
                .setPositiveButton("OK", null).show();
            return true;
        }
        String host = uri.getHost();
        String origin = Uri.parse(initialUrl).getHost();
        if (host == null) return true;
        boolean permitted = allowed.isEmpty() || host.equalsIgnoreCase(origin);
        for (String domain : allowed) {
            if (host.equalsIgnoreCase(domain) || host.toLowerCase(Locale.ROOT).endsWith("." + domain)) permitted = true;
        }
        if (!permitted) {
            new AlertDialog.Builder(this).setTitle("Continue inside RaavanKingX?")
                .setMessage("This destination is outside the approved website list.")
                .setPositiveButton("Continue", (d, which) -> web.loadUrl(uri.toString()))
                .setNegativeButton("Cancel", null).show();
        }
        return !permitted;
    }

    private void download(String url, String agent, String disposition, String mime) {
        if (!"https".equals(Uri.parse(url).getScheme())) { showError("This download format is not supported."); return; }
        new AlertDialog.Builder(this).setTitle("Download file?").setMessage(URLUtil.guessFileName(url, disposition, mime))
            .setNegativeButton("Cancel", null).setPositiveButton("Download", (dialog, which) -> {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    String cookie = CookieManager.getInstance().getCookie(url);
                    if (cookie != null) request.addRequestHeader("Cookie", cookie);
                    request.addRequestHeader("User-Agent", agent);
                    request.setMimeType(mime);
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    String filename = URLUtil.guessFileName(url, disposition, mime);
                    if (Build.VERSION.SDK_INT >= 29) request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
                    else request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, filename);
                    ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(request);
                } catch (Exception error) { showError("This file could not be downloaded."); }
            }).show();
    }
    private void showError(String message) {
        if (isFinishing()) return;
        progress.setVisibility(View.INVISIBLE);
        new AlertDialog.Builder(this).setTitle("Unable to open app").setMessage(message)
            .setPositiveButton("Retry", (d, w) -> web.reload()).setNegativeButton("Back to apps", (d, w) -> finish()).show();
    }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private Button tool(LinearLayout bar, String symbol, String label, Runnable action) {
        Button button = new Button(this);
        button.setText(symbol); button.setTextSize(23); button.setTextColor(FOREGROUND);
        button.setBackgroundColor(HEADER); button.setContentDescription(label);
        if (Build.VERSION.SDK_INT >= 26) button.setTooltipText(label);
        button.setPadding(0, 0, 0, 0); button.setMinWidth(0); button.setMinimumWidth(0);
        button.setOnClickListener(v -> action.run());
        bar.addView(button, new LinearLayout.LayoutParams(dp(44), -1)); return button;
    }
    private void hideFullscreen() {
        if (fullscreen == null) return;
        content.removeView(fullscreen); fullscreen = null;
        if (fullscreenCallback != null) fullscreenCallback.onCustomViewHidden();
        fullscreenCallback = null;
    }
    @Override public void onBackPressed() {
        if (fullscreen != null) hideFullscreen();
        else if (web.canGoBack()) web.goBack(); else finish();
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == 42 && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data)); fileCallback = null;
        }
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (web != null) { content.removeAllViews(); web.destroy(); }
        super.onDestroy();
    }
}
