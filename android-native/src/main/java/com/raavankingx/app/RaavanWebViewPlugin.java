package com.raavankingx.app;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "RaavanWebView")
public class RaavanWebViewPlugin extends Plugin {
    @PluginMethod public void open(PluginCall call) {
        String url = call.getString("url", "");
        Uri uri = Uri.parse(url);
        if (!"https".equals(uri.getScheme()) || uri.getHost() == null) {
            call.reject("Only secure HTTPS links can be opened.");
            return;
        }
        Intent intent = new Intent(getActivity(), WebViewActivity.class);
        intent.putExtra("url", url);
        if (call.getArray("allowedDomains") != null) {
            intent.putExtra("allowedDomains", call.getArray("allowedDomains").toString());
        }
        getActivity().startActivity(intent);
        call.resolve();
    }
}
