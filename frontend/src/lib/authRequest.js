import { ipAddress } from '$lib/store.js';
import { error } from '@sveltejs/kit';

export async function authRequest(url, method, accessToken, refreshToken, postData) {
	let data;
	// Get the access token from cookies
	//console.log('ipAddress', ipAddress + url);

	const ogResponse = await fetch(ipAddress + url, {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		// if data is not null, send it as the body
		body: postData ? JSON.stringify(postData) : null
	});

	if (ogResponse.status === 200) {
		console.log('Original request successful');
		data = await ogResponse.json();
		return { data, newAccessToken: null, error: null };
	} else if (ogResponse.status === 299) {
		console.log('need to refresh token');
		const newAccessToken = await getNewAccessToken(refreshToken);
		//console.log('newAccessToken', newAccessToken);

		if (!newAccessToken) {
			console.log('Failed to get new access token');
			return {
				data: null,
				newAccessToken: null,
				error: {
					status: 500,
					message: 'Failed to get new access token',
					buttonText: 'Internal Server Error',
					redirectPath: '/user'
				}
			};
		}
		// retry original request with new access token
		const retryResponse = await fetch(ipAddress + url, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${newAccessToken}`
			}
		});

		if (retryResponse.status === 200) {
			console.log('Retry request successful');
			data = await retryResponse.json();

			return { data, newAccessToken: newAccessToken, error: null };
		} else {
			console.log('Retry request failed');

			return {
				data: null,
				newAccessToken: null,
				error: {
					status: retryResponse.status,
					message: 'Retry request failed',
					statusText: retryResponse.statusText
				}
			};
		}
	} else if (!ogResponse.ok) {
		console.log(ogResponse);
		return {
			data: null,
			newAccessToken: null,
			error: {
				status: ogResponse.status,
				message: ogResponse.statusText,
				buttonText: 'Return to home',
				redirectPath: '/user'
			}
		};
	}
}

async function getNewAccessToken(refreshToken) {
	const refreshResponse = await fetch(`${ipAddress}/create_access`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			refresh_token: refreshToken
		})
	});
	if (refreshResponse.status === 200) {
		const data = await refreshResponse.json();
		return data.access_token;
	} else {
		console.error('Failed to get new access token');
		return null;
	}
}
