import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import { getConfigFields } from './config.js'
import { updateFeedbacks } from './feedbacks.js'
import { updateVariables } from './variables.js'
import got from 'got'

class GoogleCalendarInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.accessToken = null
		this.tokenExpiry = 0
		this.pollInterval = null
		this.retryTimeout = null
		this.nextEvent = null
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		updateFeedbacks(this)
		updateVariables(this)

		const refreshed = await this.refreshAccessToken()
		if (refreshed) {
			this.startPolling()
		} else {
			// Retry token refresh after 30 seconds if it failed on init
			this.log('warn', 'Initial token refresh failed, will retry in 30 seconds')
			this.retryTimeout = setTimeout(async () => {
				const retryRefreshed = await this.refreshAccessToken()
				if (retryRefreshed) {
					this.startPolling()
				}
			}, 30000)
		}
	}

	async destroy() {
		if (this.pollInterval) {
			clearInterval(this.pollInterval)
			this.pollInterval = null
		}
		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout)
			this.retryTimeout = null
		}
	}

	async configUpdated(config) {
		this.config = config

		if (this.pollInterval) {
			clearInterval(this.pollInterval)
		}

		await this.refreshAccessToken()
		this.startPolling()
	}

	getConfigFields() {
		return getConfigFields()
	}

	async refreshAccessToken() {
		if (!this.config.clientId || !this.config.clientSecret || !this.config.refreshToken) {
			this.updateStatus(InstanceStatus.BadConfig, 'Missing OAuth credentials')
			return false
		}

		try {
			const response = await got.post('https://oauth2.googleapis.com/token', {
				form: {
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					refresh_token: this.config.refreshToken,
					grant_type: 'refresh_token'
				},
				responseType: 'json'
			})

			this.accessToken = response.body.access_token
			this.tokenExpiry = Date.now() + (response.body.expires_in * 1000) - 60000 // 1 min buffer

			this.log('info', 'Access token refreshed successfully')
			return true
		} catch (error) {
			this.log('error', `Token refresh failed: ${error.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, `Token refresh failed: ${error.message}`)
			return false
		}
	}

	async fetchNextEvent() {
		// Refresh token if needed
		if (Date.now() >= this.tokenExpiry) {
			const refreshed = await this.refreshAccessToken()
			if (!refreshed) return
		}

		const calendarId = this.config.calendarId || 'primary'
		const timeMin = new Date().toISOString()

		try {
			const response = await got.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
				searchParams: {
					timeMin: timeMin,
					maxResults: 1,
					singleEvents: 'true',
					orderBy: 'startTime'
				},
				headers: {
					'Authorization': `Bearer ${this.accessToken}`
				},
				responseType: 'json'
			})

			if (response.body.items && response.body.items.length > 0) {
				this.nextEvent = response.body.items[0]
				this.updateStatus(InstanceStatus.Ok)
				this.log('debug', `Next event: ${this.nextEvent.summary}`)
			} else {
				this.nextEvent = null
				this.updateStatus(InstanceStatus.Ok, 'No upcoming events')
			}

			this.checkFeedbacks()
			// Set base variables
			const baseVars = {
				event_summary: this.nextEvent?.summary || 'No upcoming events',
				event_start: this.nextEvent?.start?.dateTime || '',
				event_end: this.nextEvent?.end?.dateTime || '',
				event_location: this.nextEvent?.location || '',
				event_organizer: this.nextEvent?.organizer?.displayName || ''
			}

			// Format dates and times if we have an event
			if (this.nextEvent?.start?.dateTime) {
				const startDate = new Date(this.nextEvent.start.dateTime)
				const endDate = new Date(this.nextEvent.end.dateTime)
				const timeUntil = this.calculateTimeUntil(startDate)

				baseVars.start_time_12h = this.formatTime12Hour(startDate, false)
				baseVars.start_time_24h = this.formatTime24Hour(startDate, false)
				baseVars.start_time_12h_seconds = this.formatTime12Hour(startDate, true)
				baseVars.start_time_24h_seconds = this.formatTime24Hour(startDate, true)

				baseVars.end_time_12h = this.formatTime12Hour(endDate, false)
				baseVars.end_time_24h = this.formatTime24Hour(endDate, false)
				baseVars.end_time_12h_seconds = this.formatTime12Hour(endDate, true)
				baseVars.end_time_24h_seconds = this.formatTime24Hour(endDate, true)

				baseVars.start_date_mmddyy = this.formatDateMMDDYY(startDate)
				baseVars.start_date_mmdd = this.formatDateMMDD(startDate)
				baseVars.start_date_text = this.formatDateText(startDate, false)
				baseVars.start_date_text_full = this.formatDateText(startDate, true)

				baseVars.days_until = Math.floor(timeUntil.seconds / 86400)
				baseVars.hours_until = timeUntil.hours
				baseVars.minutes_until = timeUntil.minutes
				baseVars.seconds_until = timeUntil.seconds
				baseVars.time_until_formatted = timeUntil.formatted
			} else {
				// Clear formatted variables if no event
				baseVars.start_time_12h = ''
				baseVars.start_time_24h = ''
				baseVars.start_time_12h_seconds = ''
				baseVars.start_time_24h_seconds = ''
				baseVars.end_time_12h = ''
				baseVars.end_time_24h = ''
				baseVars.end_time_12h_seconds = ''
				baseVars.end_time_24h_seconds = ''
				baseVars.start_date_mmddyy = ''
				baseVars.start_date_mmdd = ''
				baseVars.start_date_text = ''
				baseVars.start_date_text_full = ''
				baseVars.days_until = ''
				baseVars.hours_until = ''
				baseVars.minutes_until = ''
				baseVars.seconds_until = ''
				baseVars.time_until_formatted = ''
			}

			this.setVariableValues(baseVars)

		} catch (error) {
			this.log('error', `Failed to fetch calendar: ${error.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
		}
	}

	startPolling() {
		// Initial fetch
		this.fetchNextEvent()

		// Set up polling interval (default 5 minutes)
		const pollMinutes = this.config.pollInterval || 5
		this.pollInterval = setInterval(() => {
			this.fetchNextEvent()
		}, pollMinutes * 60 * 1000)

		this.log('info', `Polling every ${pollMinutes} minutes`)
	}

	formatTime12Hour(date, includeSeconds = false) {
		let hours = date.getHours()
		const minutes = date.getMinutes().toString().padStart(2, '0')
		const seconds = date.getSeconds().toString().padStart(2, '0')
		const ampm = hours >= 12 ? 'PM' : 'AM'

		hours = hours % 12
		hours = hours ? hours : 12 // 0 should be 12

		if (includeSeconds) {
			return `${hours}:${minutes}:${seconds} ${ampm}`
		}
		return `${hours}:${minutes} ${ampm}`
	}

	formatTime24Hour(date, includeSeconds = false) {
		const hours = date.getHours().toString().padStart(2, '0')
		const minutes = date.getMinutes().toString().padStart(2, '0')
		const seconds = date.getSeconds().toString().padStart(2, '0')

		if (includeSeconds) {
			return `${hours}:${minutes}:${seconds}`
		}
		return `${hours}:${minutes}`
	}

	formatDateMMDDYY(date) {
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')
		const year = date.getFullYear().toString().slice(-2)
		return `${month}/${day}/${year}`
	}

	formatDateMMDD(date) {
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')
		return `${month}/${day}`
	}

	formatDateText(date, includeYear = false) {
		const months = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December']
		const monthName = months[date.getMonth()]
		const day = date.getDate()

		if (includeYear) {
			return `${monthName} ${day}, ${date.getFullYear()}`
		}
		return `${monthName} ${day}`
	}

	calculateTimeUntil(eventDate) {
		const now = new Date()
		const diff = eventDate - now

		if (diff < 0) {
			return {
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
				formatted: 'Event started'
			}
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24))
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
		const seconds = Math.floor((diff % (1000 * 60)) / 1000)

		// Format as "2d 3h 15m" or "3h 15m" or "15m" etc
		let formatted = ''
		if (days > 0) formatted += `${days}d `
		if (hours > 0 || days > 0) formatted += `${hours}h `
		if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m`
		if (!formatted) formatted = `${seconds}s`

		return {
			days,
			hours: days * 24 + hours, // Total hours
			minutes: (days * 24 * 60) + (hours * 60) + minutes, // Total minutes
			seconds: Math.floor(diff / 1000), // Total seconds
			formatted: formatted.trim()
		}
	}
}

runEntrypoint(GoogleCalendarInstance, [])
