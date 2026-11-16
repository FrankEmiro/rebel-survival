<p align="center"><a href="https://github.com/FrankEmiro/rebel-survival/releases/latest"><img src="icons/icon-rs-512.png" alt="Rebel Survival" width="140"></a></p>

<h1 align="center">Rebel Survival</h1>

<p align="center">
  <b>The app to prepare for emergencies and get through them, even without internet.</b><br>
  Guides that gather information from several sources, step-by-step plans for each scenario, supply calculators, practical tools, offline Wikipedia and a Bluetooth chat between nearby phones. No account: your data stays on your phone.
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: GPL v3" src="https://img.shields.io/badge/license-GPL%20v3-6366f1"></a>
  <img alt="Works offline" src="https://img.shields.io/badge/works-offline-10b981">
  <img alt="Android 8 or later" src="https://img.shields.io/badge/Android-8.0%2B-3ddc84">
  <img alt="No account" src="https://img.shields.io/badge/account-none-ec4899">
  <img alt="Italian" src="https://img.shields.io/badge/UI-Italian-3b82f6">
  <a href="https://cyberrebellion.site/en/"><img alt="Made by Cyber Rebellion" src="https://img.shields.io/badge/made%20by-Cyber%20Rebellion-ef4444"></a>
</p>

<p align="center"><a href="README.md">🇮🇹 Italiano</a> · 🇬🇧 English</p>

<p align="center">
  <a href="https://github.com/FrankEmiro/rebel-survival/releases/latest"><b>⬇ Download for Android</b></a>
</p>

> 🏴 **Rebel Survival is a [Cyber Rebellion](https://cyberrebellion.site/en/) project.** The app is free and its code is public. The app and its guides are in **Italian** and draw on Italian official sources where possible. Ideas, bug reports and corrections to the guides are welcome in the [issues](https://github.com/FrankEmiro/rebel-survival/issues).

## The problem

When power, water or the phone network go down, you need information right away, and often there is no internet. Official advice exists, but it is spread across different sites and PDFs. Preparing in advance (how much water and food to keep at home, what to pack in a go-bag) takes time and maths that nobody does.

## What Rebel Survival does

It puts in **one app that works offline** what you need **before** an emergency (supplies, plans, kits) and what you need **during** one (what to do step by step, tools, talking to people nearby). It is an Android app, free to download from GitHub.

## ✨ Highlights

| | |
|---|---|
| 🚨 **What is happening?** | Pick the situation and the app gives you the plan to follow, step by step. **21 scenarios**: short and long blackout, earthquake, flood, tsunami, volcano, wildfire, heat wave, winter storm, evacuation, lack of water, food or gas, pandemic, economic crisis, cyberattack, conflict, nuclear or radiological incident, survival in the wild and more. |
| 📚 **Guides from several sources** | **47 guides** in 8 areas (water, food, energy, heat, health, communications, mobility, home and people), with illustrated diagrams. We have tried to gather and combine information from several sources (Italian Civil Protection, WHO, Ready.gov, ERC and others), with a link to the source where available. **We do not guarantee it is complete, correct or up to date.** Guides with unofficial or still unchecked sources are marked **"Caution"** and can be hidden. Plus the **Italian Civil Protection PDF guides**. |
| 🧮 **Supply calculators** | How much water and food your family needs, how many days your energy lasts, heating, fuel. They are rough estimates based on public recommendations and your profile: not a guarantee. |
| 🎒 **Supplies and kits** | What you already have and what is missing, area by area: water, food, energy, health, hygiene, go-bag. With a ready **shopping list**. |
| 🔦 **Tools** | Flashlight, SOS signal, compass, GPS position, map with Italian municipal, provincial and regional borders, battery and network status. The screen can stay on. |
| 📖 **Offline Wikipedia** | Choose and download the parts of Wikipedia you need (for example medicine) and read them with no connection. Files come from Kiwix; the reader is built into the app. On Android the download keeps going with the app in the background. |
| 📡 **Chat with nearby phones** *(Android, experimental)* | Messages over **Bluetooth, with no internet and no phone network**. Messages hop from phone to phone up to 7 times; private ones are encrypted. Compatible with the **bitchat** app for Android and iPhone. |
| 💬 **Assistant** *(experimental)* | Ask in your own words: the app searches its guides **offline** and always shows the source. On more powerful phones it can also write the answer with an AI model that runs on the phone itself. |
| 📲 **Pass it to people without internet** | Share your plan with a **QR code**. Send the whole app to another phone over Bluetooth or Quick Share: the APK, or a single-file offline copy that opens in a browser. |
| 🔒 **Privacy** | No account, no sign-up. Profile, supplies and messages stay on the phone; you can export them to a backup and import them again. |

## How to use it

1. **Download the app** from the [latest release](https://github.com/FrankEmiro/rebel-survival/releases/latest) (file `RebelSurvival.apk`) and install it: the phone will ask you to allow installs from this source.
2. **Fill in your profile**: how many people, any pets, what you already have at home.
3. **Prepare your supplies** with the calculators and lists, area by area.
4. **In an emergency** tap "What is happening?" and follow the plan. Everything works without a connection.

> ⚠️ **Important warnings.**
> - Rebel Survival **gathers and summarises information from several sources**. It may contain errors, omissions or outdated advice. **It is not an emergency service, nor medical, legal or technical advice.**
> - **The provider accepts no responsibility** for harm to people or property arising from the use of the app, guides, calculations or experimental features. **Use it at your own risk.**
> - **You must be aware of the risks** of the activities described (for example fire, unsafe water, medicines, food, travel) and always check the information against official sources. If in doubt, don't do it.
> - In danger call **112** and follow Civil Protection and local authorities: they come before anything you read here.
> - Features marked "experimental" may not work on every phone: don't rely on them as your only means.

## For developers

It is a static web app with **no build step and no npm dependencies**: HTML, CSS and plain JavaScript, one module per section. The Android app wraps the same files in a WebView and adds the native parts (Bluetooth chat, background downloads).

```bash
git clone https://github.com/FrankEmiro/rebel-survival.git
cd rebel-survival
npm start          # or: python3 -m http.server 5500
```
Then open **http://localhost:5500**. Project structure, release steps and the Android build are described in the [Italian README](README.md#per-sviluppatori) and in [android/LEGGIMI.md](android/LEGGIMI.md).

**Contributing to the guides:** they concern people's safety. **For every practical instruction (doses, numbers, distances, procedures) we look for an official source.** Please include the link to the source with any change.

## Third-party libraries and content

- [Leaflet](https://leafletjs.com) 1.9.4 (BSD-2-Clause) · [Phosphor Icons](https://phosphoricons.com) (MIT) · QR Code Generator by Kazuhiko Arase (MIT) · [fzstd](https://github.com/101arrowz/fzstd) (MIT)
- [bitchat-android](https://github.com/permissionlesstech/bitchat-android) for the Bluetooth chat, in `android/mesh` (GPL v3)
- Fonts Rajdhani, Nunito and JetBrains Mono (SIL Open Font License 1.1)
- Maps © OpenStreetMap contributors (ODbL); Wikipedia pages © Wikipedia authors (CC BY-SA), via Kiwix; PDF guides © Italian Civil Protection Department

## Cyber Rebellion

[Cyber Rebellion](https://cyberrebellion.site/en/) is a network of independent professionals based in Italy that brings AI agents into companies. Rebel Survival is our emergency-preparedness project, free and open to everyone.

⭐ If the app is useful to you, **[star the repository](https://github.com/FrankEmiro/rebel-survival)**: it helps other people find it.

## License

Rebel Survival is free software under the **[GNU GPL version 3](LICENSE)**. In short:

- **You can** use it for free, study it, modify it and share it.
- **If you distribute it**, modified or not, you must provide the source code under the same licence.
- **Not covered** by the licence: the "Rebel Survival" name and logo, the Civil Protection PDF guides and the third-party libraries, each under its own licence.

This is a summary: the licence text is what counts.
