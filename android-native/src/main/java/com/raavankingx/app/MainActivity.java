package com.raavankingx.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RaavanWebViewPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
