package com.whatsou.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Manually register plugins to ensure they are available
        registerPlugin(com.capacitorjs.plugins.camera.CameraPlugin.class);
        registerPlugin(com.capacitorjs.plugins.geolocation.GeolocationPlugin.class);
        registerPlugin(com.capacitorjs.plugins.haptics.HapticsPlugin.class);
        registerPlugin(com.capacitorjs.plugins.preferences.PreferencesPlugin.class);
        registerPlugin(com.capacitorjs.plugins.share.SharePlugin.class);
        registerPlugin(com.epicshaggy.biometric.NativeBiometric.class);
        
        super.onCreate(savedInstanceState);
    }
}
