<script>
	// Imports
	import StoryFullView from '$lib/components/StoryFullView.svelte';
	import AudioPlayer from '$lib/components/audio/AudioPlayer.svelte';
	import OrgHeader from '$lib/components/OrgHeader.svelte';
    import WordCloud from '$lib/components/WordCloud.svelte';
	import { accessToken, refreshToken } from '$lib/store.js';
	import { authRequest } from '$lib/authRequest.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Page state
	let themeColor = $state('#133335');
    let wordCloudData = $state(null); // To store data from the insights API

	// Fetch the data when the component mounts
	const org_id = $page.params.org_id;
	const story_id = $page.params.story_id;
	let media = $state(false);
	let includesAudio = $state(false);
	let includesImage = $state(false);
	$inspect(includesImage);

	// Org state
	let orgData = $state({
		orgName: 'Loading...',
		description: 'Loading...',
		projectsTotal: 0,
		storiesTotal: 0
	});

	// Story page
	let storyData = $state({
		storyteller: 'Loading...',
		project_name: 'Loading...',
		curator: 'Loading...',
		text_content: 'Loading...',
		summary: 'Loading...'
	});

	$inspect(orgData);
	$inspect(storyData);

	// API call
	onMount(async () => {
		// Make both requests concurrently using Promise.all
		const [orgResponse, storyResponse] = await Promise.all([
			authRequest(`/org/${org_id}`, 'GET', $accessToken, $refreshToken),
			authRequest(`/story/${story_id}`, 'GET', $accessToken, $refreshToken)
		]);

		if (orgResponse.newAccessToken) {
			accessToken.set(orgResponse.newAccessToken);
		}
        if (storyResponse.newAccessToken && !orgResponse.newAccessToken) { // Check if token updated by second req
            accessToken.set(storyResponse.newAccessToken);
        }

		orgData = orgResponse.data;
		storyData = storyResponse.data;

		includesAudio = storyData.audio_path != '';
		includesImage = storyData.image_path != '';
		if (includesAudio || includesImage) media = true;

        // Fetch word cloud data if story text exists
        if (storyData.text_content && storyData.text_content.trim().length > 0) {
          try {
            const insightsResponse = await authRequest(
              `/api/story/${story_id}/insights/`,
              'GET',
              $accessToken,
              $refreshToken
            );
            if (insightsResponse.newAccessToken) {
                accessToken.set(insightsResponse.newAccessToken);
            }
            if (insightsResponse.data && insightsResponse.data.word_frequencies) {
              wordCloudData = insightsResponse.data.word_frequencies;
            } else {
              console.error('Word cloud data not found in API response:', insightsResponse);
              wordCloudData = []; // Set to empty to avoid errors, show message in component
            }
          } catch (error) {
            console.error('Failed to fetch story insights:', error);
            wordCloudData = []; // Set to empty on error
          }
        } else {
            wordCloudData = []; // No text content, so no data for word cloud
        }
	});
</script>

<div id="container" class="mb-6">
	<div class="breadcrumb-nav mb-5 mt-3">
		<nav class="breadcrumb nav-color" aria-label="breadcrumbs">
			<ul>
				<li><a href="/">Home</a></li>
				<li>
					<a href="/org/{orgData.org_id}"><b>Organization</b>: {orgData.name || 'Organization'}</a>
				</li>
				<li class="">
					<a href="/org/{orgData.org_id}/project/{storyData.project_id}" aria-current="page"
						><b>Project</b>: {storyData.project_name}</a
					>
				</li>
				<li class="is-active">
					<a href="/org/{orgData.org_id}/story/{story_id}" aria-current="page"
						><b>Story</b>: {story_id}</a
					>
				</li>
			</ul>
		</nav>
	</div>
	<div class="container-is-fullhd">
		<div class="columns">
			<div class="column is-1"></div>
			{#if media}
				<div class="column is-6">
					<StoryFullView story={storyData}></StoryFullView>
                    {#if wordCloudData && wordCloudData.length > 0}
                      <div class="section wordcloud-section mt-5 card">
                        <div class="card-content">
                          <h3 class="title is-4 has-text-centered">Story Word Cloud</h3>
                          <WordCloud wordFrequencies={wordCloudData} />
                        </div>
                      </div>
                    {:else if storyData.text_content && storyData.text_content.trim().length > 0 && (!wordCloudData || wordCloudData.length === 0) }
                        <div class="section wordcloud-section mt-5 card">
                            <div class="card-content">
                                <h3 class="title is-4 has-text-centered">Story Word Cloud</h3>
                                <p class="has-text-centered">Could not generate word cloud. There might be too few words after filtering, or an error occurred.</p>
                            </div>
                        </div>
                    {/if}
				</div>
			{:else}
				<div class="column is-10">
					<StoryFullView story={storyData}></StoryFullView>
                    {#if wordCloudData && wordCloudData.length > 0}
                      <div class="section wordcloud-section mt-5 card">
                        <div class="card-content">
                          <h3 class="title is-4 has-text-centered">Story Word Cloud</h3>
                          <WordCloud wordFrequencies={wordCloudData} />
                        </div>
                      </div>
                    {:else if storyData.text_content && storyData.text_content.trim().length > 0 && (!wordCloudData || wordCloudData.length === 0) }
                        <div class="section wordcloud-section mt-5 card">
                            <div class="card-content">
                                <h3 class="title is-4 has-text-centered">Story Word Cloud</h3>
                                <p class="has-text-centered">Could not generate word cloud. There might be too few words after filtering, or an error occurred.</p>
                            </div>
                        </div>
                    {/if}
				</div>
			{/if}

			{#if media}
				<div class="column">
					<!-- Are we displaying a single image or multiple? -->
					<div class="row">
						{#if includesAudio}
							<div class="media">
								<div class="media-right" id="audio">
									<div class="audio">
										<AudioPlayer src={storyData.audio_path}></AudioPlayer>
									</div>
								</div>
							</div>
						{/if}
						{#if includesImage}
							<div class="media">
								<div class="media-right" id="images">
									<img src={storyData.image_path} alt="Story image" />
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
			<div class="column is-1"></div>
		</div>
	</div>
</div>

<style>
	p {
		padding: 10%;
	}

	#container {
		margin-top: 50px;
		width: 90%;
		height: 90%;
		margin-left: auto;
		margin-right: auto;
		justify-content: center;
	}

	#images {
		/* max-height: 300px; */
		max-width: 100%;
		/* margin: 0 10px; */
		object-fit: contain;
	}

	.audio {
		object-fit: contain;
	}

	li a {
		color: black;
	}

	li.is-active {
		color: #133335 !important;
	}

    .wordcloud-section .card-content {
        padding: 1.5rem; /* Bulma card content padding */
    }
    .wordcloud-section h3 {
        margin-bottom: 1rem; /* Space below the title */
    }
</style>
