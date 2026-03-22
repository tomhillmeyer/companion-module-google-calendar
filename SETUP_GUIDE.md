# Google Calendar Module - Setup Guide

## What I've Created

I've built a complete Companion module for Google Calendar with the following files:

### Module Files:
- **src/main.js** - Main module logic with OAuth token refresh and calendar polling
- **src/config.js** - Configuration fields for OAuth credentials and settings
- **src/variables.js** - Variable definitions for event data
- **src/feedbacks.js** - Feedbacks placeholder (currently empty)
- **package.json** - NPM package configuration with dependencies
- **companion/HELP.md** - Detailed user documentation
- **README.md** - Repository documentation
- **.gitignore** - Git ignore rules

## How to Install in Your Repository

### Option 1: Upload Files to GitHub

1. Clone your repository locally:
   ```bash
   git clone https://github.com/tomhillmeyer/companion-module-google-calendar.git
   cd companion-module-google-calendar
   ```

2. Extract the module files I created:
   ```bash
   # Download google-calendar-module.tar.gz from Companion
   tar -xzf google-calendar-module.tar.gz
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Add Google Calendar module implementation"
   git push
   ```

### Option 2: Manual Upload

1. Download each file from this conversation
2. In your GitHub repository, click "Add file" > "Upload files"
3. Upload all the files maintaining the directory structure

## How to Develop and Test

1. **Install dependencies:**
   ```bash
   cd companion-module-google-calendar
   yarn install
   ```

2. **Run in development mode:**
   ```bash
   yarn dev
   ```
   This starts a local development server that Companion can connect to.

3. **Add to Companion:**
   - Open Companion
   - Go to Connections
   - Add a new connection
   - Select "Google Calendar" (Developer mode)
   - Enter your OAuth credentials

## Module Configuration

The module requires:
- **OAuth Client ID** - From Google Cloud Console
- **OAuth Client Secret** - From Google Cloud Console
- **Refresh Token** - From OAuth Playground
- **Calendar ID** (optional) - Defaults to "primary"
- **Poll Interval** (optional) - Defaults to 5 minutes

## Available Variables

Once configured, the module provides these variables:

- `$(google-calendar:event_summary)` - Event name
- `$(google-calendar:event_start)` - Start time (ISO 8601)
- `$(google-calendar:event_end)` - End time (ISO 8601)
- `$(google-calendar:event_location)` - Location
- `$(google-calendar:event_organizer)` - Organizer name

## Key Features

✅ **Automatic Token Refresh** - No more 401 errors! The module automatically refreshes your access token before it expires.

✅ **Configurable Polling** - Set how often to check for calendar updates (1-60 minutes)

✅ **Multiple Calendar Support** - Use any calendar you have access to, not just your primary

✅ **Clean Variable Names** - Easy to use in Companion expressions

## Building for Production

When you're ready to distribute:

```bash
yarn build
```

This creates a compiled module in the `dist/` folder ready for installation in Companion.

## Next Steps

1. Upload the files to your GitHub repository
2. Install dependencies with `yarn install`
3. Test in development mode with `yarn dev`
4. Configure with your OAuth credentials
5. Use the variables in your Companion buttons!

## Using Your Custom Expression

You can still use your time formatting expression! Just use the `event_start` variable:

```
dt = $(google-calendar:event_start),
hour = +substr(dt, 11, 13),
displayHour = hour > 12 ? hour - 12 : hour,
displayHour = displayHour == 0 ? 12 : displayHour,
ampm = hour >= 12 ? " PM" : " AM",
concat(displayHour, ":", substr(dt, 14, 16), ampm)
```

The module handles all the OAuth complexity behind the scenes!
