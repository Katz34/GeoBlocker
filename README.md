# GeoBlocker User Guide
## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Personal-API](#how-to-setup-your-personal-api-key)

## Introduction
GeoBlocker is a self-hosted chrome extension. It completely removes content from a specific country listed by the user on the pop-up interface of the extension. Content removal takes place on homepage, search results, video recommendations tab, and suggested video tiles after a video ends.


## Installation
STEP-1: Save this repository locally on your computer <br>
STEP-2: Open any chromium-based browser of your choice (basically every browser except FireFox) <br>
STEP-3: Search chrome://extensions on your search bar <br>
STEP-4: Enable the Developer Mode toggle on the top-right corner of your screen<br>
STEP-5: A new menu will appear on the top. Click on Load Unpacked on the top-left corner<br>
STEP-6: Insert the GeoBlocker file you saved locally <br>
After following these steps, you'll be able to see this extension in your extensions section of your browser. Now, you may open Youtube, activate this extension by clicking on it. Enter your [API-Key](#how-to-setup-your-personal-api-key), and the two-letter code of the countries you want to block the content of. That's it.
## How to setup your personal API key 
API Keys cost no money. I've mentioned it as I used to think they were paid. But anyways here are the steps to generate your API key for this to work. <br>
STEP-1: Head over to <a href="https://console.cloud.google.com/" target="_blank">https://console.cloud.google.com/</a><br>
STEP-2: Click on new project, give it any name you like and keep the Organisation option set to "No Organisation"<br>
STEP-3: Click on the three lines option ont he top-left corner. Scroll if you have to, to find APIs and services. Then select Credentials.<br>
STEP-4: Click on Create credentials, select API Key from the drop-down.
STEP-5: Leave Application restrictions to None, and set API restrictions to Youtube Data API v3, then click on create.<br>
STEP-6: Now before enabling it, just copy it first, by clicking Show key<br>
STEP-7: Head back to Enabled APIs and services to enable it. Enable it by clicking on Enable APIs and services in blue colour on the top.
Now you have your API Key.
## About Creator
Hi, my name is Nachiket Soni and I'm studying engineering at Delhi Technological University. I built this project because I got fed up of low quality educational videos on Youtube. I had to scroll a lot in order to actaully find something decent. I hope you enjoy using this. P.S - This project is completely vibe coded T-T.