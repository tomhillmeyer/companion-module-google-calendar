export function updateVariables(instance) {
	const variables = [
		// Raw ISO 8601 formats
		{
			variableId: 'event_summary',
			name: 'Next Event Name'
		},
		{
			variableId: 'event_start',
			name: 'Next Event Start Time (ISO 8601)'
		},
		{
			variableId: 'event_end',
			name: 'Next Event End Time (ISO 8601)'
		},
		{
			variableId: 'event_location',
			name: 'Next Event Location'
		},
		{
			variableId: 'event_organizer',
			name: 'Next Event Organizer'
		},

		// Formatted start times
		{
			variableId: 'start_time_12h',
			name: 'Start Time (12-hour, e.g., 8:00 AM)'
		},
		{
			variableId: 'start_time_24h',
			name: 'Start Time (24-hour, e.g., 08:00)'
		},
		{
			variableId: 'start_time_12h_seconds',
			name: 'Start Time with Seconds (12-hour, e.g., 8:00:00 AM)'
		},
		{
			variableId: 'start_time_24h_seconds',
			name: 'Start Time with Seconds (24-hour, e.g., 08:00:00)'
		},

		// Formatted end times
		{
			variableId: 'end_time_12h',
			name: 'End Time (12-hour, e.g., 9:00 AM)'
		},
		{
			variableId: 'end_time_24h',
			name: 'End Time (24-hour, e.g., 09:00)'
		},
		{
			variableId: 'end_time_12h_seconds',
			name: 'End Time with Seconds (12-hour, e.g., 9:00:00 AM)'
		},
		{
			variableId: 'end_time_24h_seconds',
			name: 'End Time with Seconds (24-hour, e.g., 09:00:00)'
		},

		// Formatted dates
		{
			variableId: 'start_date_mmddyy',
			name: 'Start Date (MM/DD/YY, e.g., 03/23/26)'
		},
		{
			variableId: 'start_date_mmdd',
			name: 'Start Date (MM/DD, e.g., 03/23)'
		},
		{
			variableId: 'start_date_text',
			name: 'Start Date (Plain text, e.g., March 23)'
		},
		{
			variableId: 'start_date_text_full',
			name: 'Start Date (Full text, e.g., March 23, 2026)'
		},

		// Time until event
		{
			variableId: 'days_until',
			name: 'Days Until Event'
		},
		{
			variableId: 'hours_until',
			name: 'Hours Until Event'
		},
		{
			variableId: 'minutes_until',
			name: 'Minutes Until Event'
		},
		{
			variableId: 'seconds_until',
			name: 'Seconds Until Event'
		},
		{
			variableId: 'time_until_formatted',
			name: 'Time Until Event (Formatted, e.g., 2d 3h 15m)'
		}
	]

	instance.setVariableDefinitions(variables)

	// Set initial values
	const emptyValues = {
		event_summary: 'Loading...',
		event_start: '',
		event_end: '',
		event_location: '',
		event_organizer: '',
		start_time_12h: '',
		start_time_24h: '',
		start_time_12h_seconds: '',
		start_time_24h_seconds: '',
		end_time_12h: '',
		end_time_24h: '',
		end_time_12h_seconds: '',
		end_time_24h_seconds: '',
		start_date_mmddyy: '',
		start_date_mmdd: '',
		start_date_text: '',
		start_date_text_full: '',
		days_until: '',
		hours_until: '',
		minutes_until: '',
		seconds_until: '',
		time_until_formatted: ''
	}

	instance.setVariableValues(emptyValues)
}