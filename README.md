# companion-module-google-calendar

A Bitfocus Companion module for integrating with Google Calendar.

## Features

- ✅ OAuth 2.0 authentication with automatic token refresh
- ✅ Poll for upcoming calendar events
- ✅ Display next event details (name, time, location, organizer)
- ✅ Support for multiple calendars
- ✅ Configurable polling interval

## Installation

### For Development

1. Clone this repository
2. Run `yarn install` or `npm install`
3. Run `yarn dev` or `npm run dev` to start the development server
4. Add the module in Companion's connections

### For Use in Companion

1. Download the latest release
2. Place the module in your Companion modules directory
3. Restart Companion
4. Add "Google Calendar" as a connection

## Configuration

See [HELP.md](companion/HELP.md) for detailed setup instructions.

### Quick Start

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Get a refresh token from [OAuth Playground](https://developers.google.com/oauthplayground/)
3. Enter your credentials in the module configuration

## Available Variables

- `event_summary` - Event name
- `event_start` - Start time (ISO 8601)
- `event_end` - End time (ISO 8601)
- `event_location` - Location
- `event_organizer` - Organizer name

## Building

```bash
yarn build
```

This will create a compiled module ready for distribution.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Pull requests welcome! Please follow the existing code style.

## Support

For issues or questions, please open an issue on this repository.
