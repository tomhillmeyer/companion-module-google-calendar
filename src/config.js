export function getConfigFields() {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Google Calendar OAuth Setup',
			value: `
				<p><strong>Step 1:</strong> Create OAuth credentials in Google Cloud Console</p>
				<ol>
					<li>Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
					<li>Enable the Google Calendar API</li>
					<li>Create OAuth 2.0 Client ID credentials</li>
					<li>Add <code>https://developers.google.com/oauthplayground</code> as an authorized redirect URI</li>
				</ol>
				<p><strong>Step 2:</strong> Get your refresh token</p>
				<ol>
					<li>Go to <a href="https://developers.google.com/oauthplayground/" target="_blank">OAuth Playground</a></li>
					<li>Click settings (⚙️), check "Use your own OAuth credentials"</li>
					<li>Enter your Client ID and Client Secret</li>
					<li>Select "Calendar API v3" → <code>https://www.googleapis.com/auth/calendar.readonly</code></li>
					<li>Click "Authorize APIs" and sign in</li>
					<li>Click "Exchange authorization code for tokens"</li>
					<li>Copy the Refresh Token</li>
				</ol>
			`
		},
		{
			type: 'textinput',
			id: 'clientId',
			label: 'OAuth Client ID',
			width: 12,
			required: true
		},
		{
			type: 'textinput',
			id: 'clientSecret',
			label: 'OAuth Client Secret',
			width: 12,
			required: true
		},
		{
			type: 'textinput',
			id: 'refreshToken',
			label: 'Refresh Token',
			width: 12,
			required: true
		},
		{
			type: 'textinput',
			id: 'calendarId',
			label: 'Calendar ID',
			width: 12,
			default: 'primary',
			tooltip: 'Leave as "primary" for your main calendar, or enter a specific calendar ID (e.g., xyz@group.calendar.google.com)'
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll Interval (minutes)',
			width: 6,
			default: 5,
			min: 1,
			max: 60,
			tooltip: 'How often to check for calendar updates'
		}
	]
}
