WhatSou Google Play Publishing - Manual Steps Guide
This guide covers everything you need to do manually to publish your app.

✅ Already Done (By Code Changes)
 ProGuard/R8 enabled for release builds
 Legacy storage permissions scoped to older Android versions
 ProGuard rules for Capacitor/WebView/Firebase
📱 1. Google Play App Signing Setup
Google manages your app's signing key for better security. Here's how to set it up:

Step-by-Step:
Go to Play Console → play.google.com/console

Create your app (if not already):

Click "Create app"
App name: WhatSou
Default language: English/Arabic
App type: App (not game)
Free or Paid: Choose based on your model
Accept declarations
Navigate to App Signing:

Go to: Release → Setup → App signing
Choose "Let Google manage your app signing key" (recommended)

This is the easiest and most secure option
Google will create and secure your signing key
Upload Your First App Bundle: To complete setup, you need to upload an AAB file:

# In your project directory
cd android
# Build release AAB
./gradlew bundleRelease
The AAB will be at: android/app/build/outputs/bundle/release/app-release.aab

Upload to Internal Testing First:

Go to: Release → Testing → Internal testing
Create a release and upload the AAB
Google will sign it for you
TIP

After first upload, download your Upload key certificate from the App Signing page to use for future uploads.

🖼️ 2. Store Listing Assets
Required Assets:
Asset	Size	Format	Notes
App Icon	512×512 px	PNG (32-bit)	✅ You have this
Feature Graphic	1024×500 px	PNG or JPEG	Required
Phone Screenshots	320–3840 px	PNG or JPEG	Min 2, max 8
Tablet Screenshots	320–3840 px	PNG or JPEG	Recommended
Feature Graphic Tips:
Shows at top of your store listing
Don't include: Device frames, text with prices, or "Editor's Choice" badges
Do include: Your logo, brand colors, tagline
Use your green brand color (#008069)
Screenshot Guidelines:
Take screenshots from the running app
Show key features: Dashboard, Product adding, Storefront, Orders
Consider using Arabic and English versions
No device frames unless they look premium
Design Tool Suggestions:
Canva - Easy templates
Figma - Free design tool
App Mockup - Device frames
📝 3. Store Listing Text
Short Description (max 80 characters):
Create your WhatsApp store in 60 seconds. Photo → Price → Sell!
Full Description (suggested):
WhatSou - The fastest way to start selling on WhatsApp!
🚀 CREATE YOUR STORE IN 60 SECONDS
Simply upload a photo, set a price, and you're ready to sell. No complicated setup, no technical knowledge required.
📱 POWERFUL FEATURES
• Beautiful storefront with your branding
• Easy product management with photos
• QR code for instant sharing
• Order notifications via WhatsApp
• Delivery & pickup options
• Multi-language support (English & Arabic)
💰 PERFECT FOR
• Small businesses
• Home-based sellers
• Social media sellers
• Restaurants & cafes
• Anyone who wants to sell via WhatsApp
🎯 HOW IT WORKS
1. Sign up with your WhatsApp number
2. Add your products with photos
3. Share your store link or QR code
4. Receive orders directly on WhatsApp
Start your commerce journey today with WhatSou!
📋 4. Play Console Forms
Content Rating Questionnaire:
Navigate to: Policy → App content → Content rating

Answer honestly based on your app:

Violence: None
Sexual content: None
Language: None
Controlled substances: None
Interactive elements: Shares personal info (location for store)
User-generated content: No (products are from store owner)
Expected rating: Everyone (E) or Everyone 10+ (E10+)

Data Safety Form:
Navigate to: Policy → App content → Data safety

Based on your privacy policy, declare:

Data Type	Collected	Purpose
Phone number	Yes	Account creation, Login
Location	Yes	Store address
Photos	Yes	Product images
Name	Yes	Store name
Email	Optional	Communications
Data is:

Not sold to third parties ✅
Encrypted in transit ✅ (HTTPS)
Can be deleted on request ✅
Ads Declaration:
Your app contains ads: No (unless you add them later)
Target Audience:
Target age: 18 and up (business app)
Not designed for children: Yes
🚀 5. Final Submission Checklist
Before Submitting for Review:
 Feature graphic uploaded (1024×500)
 At least 4 screenshots uploaded
 Short description completed
 Full description completed
 Content rating questionnaire done
 Data safety form completed
 Privacy policy URL set (https://yourproductiondomain.com/privacy)
 App category selected (Shopping or Business)
 Contact email set
 AAB uploaded to release track
Testing Track Recommendation:
Internal Testing (up to 100 testers)

No review needed
Good for initial testing
Closed Testing (unlimited invitees)

Requires review
Good for beta testing
Open Testing (anyone can join)

Requires review
Good for public beta
Production

Full review required
Public release
🔧 6. Build Commands Reference
# Navigate to android folder
cd android
# Clean build
./gradlew clean
# Build debug APK (for testing)
./gradlew assembleDebug
# Build release APK
./gradlew assembleRelease
# Build release AAB (recommended for Play Store)
./gradlew bundleRelease
Output locations:

Debug APK: app/build/outputs/apk/debug/app-debug.apk
Release APK: app/build/outputs/apk/release/app-release.apk
Release AAB: app/build/outputs/bundle/release/app-release.aab
⏰ Timeline Expectations
Step	Duration
Store listing setup	1-2 hours
Asset creation	2-4 hours
Forms completion	30 mins
Internal testing	1-2 days
Review process	1-7 days (usually 1-3)
🔴 Remember: Account Deletion
Before production release, implement the Delete Account feature in Settings page to comply with Google Play requirements.

Good luck with your launch! 🚀