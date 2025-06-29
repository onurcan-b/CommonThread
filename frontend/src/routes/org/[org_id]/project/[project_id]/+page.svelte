<script>
	// assets
	import thread from '$lib/assets/illustrations/thread1.png';

	import ProjectHeader from '$lib/components/ProjectHeader.svelte';
	import DataDashboard from '$lib/components/DataDashboard.svelte';
	import StoryPreview from '$lib/components/StoryPreview.svelte';
	import Chatbox from '$lib/components/Chatbox.svelte'; // Added Chatbox import

	import { authRequest } from '$lib/authRequest.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { accessToken, refreshToken } from '$lib/store.js';
	import { showError } from '$lib/errorStore.js';

	let stories = $state([]);
	let projectData = $state({
		name: 'Loading...',
		insight: 'Loading...',
		org_id: 'Loading...',
		stories: 0
	});
	let projectsTotal = $state('...');
	let themeColor = $state('#133335');
	let type = $state('dash');
	let searchValue = $state('');
	let storiesTotalSearch = $state(0);

	console.log('Project Page - $page.params.project_id:', $page.params.project_id);
	const projectId = $page.params.project_id; // Ensure projectId is explicitly defined if not already
	const projectChatApiEndpoint = `/project/${projectId}/chat`; // Create the endpoint URL
	console.log('Project Page - constructed projectChatApiEndpoint:', projectChatApiEndpoint);
	let isLoading = $state(true);
	let initialLoad = $state(true); // To handle initial loading state
	const org_id = $page.params.org_id;


	$inspect(projectData);
	$inspect(stories);
	$inspect(searchValue);

	onMount(async () => {
		// Fetch the data when the component mounts
		const project_id = $page.params.project_id;

		try {
			// Make both requests concurrently using Promise.all
			const [storiesResponse, projectResponse] = await Promise.all([
				authRequest(`/stories?project_id=${project_id}`, 'GET', $accessToken, $refreshToken),
				authRequest(`/project/${project_id}`, 'GET', $accessToken, $refreshToken)
			]);

			// Check for project errors
			if (projectResponse?.error) {
				showError('PROJECT_NOT_FOUND');
				isLoading = false;
				return;
			} else {
				projectData = projectResponse.data;
				initialLoad = false;
			}

			const loadedData = storiesResponse.data;

			if (storiesResponse.data !== null) {
				isLoading = false;
			}
			stories = loadedData['stories'];

			storiesTotalSearch = projectData.stories;
		} catch (error) {
			console.error('Error loading project:', error);
			//showError('INTERNAL_ERROR');
			//isLoading = false;
		}
	});

	// Create a function to filter items based on search value
	function getFilteredItems() {
		if (searchValue === '') {
			return stories;
		}
		const searchTerm = searchValue.toLowerCase();
		return stories.filter((story) => story.text_content.includes(searchTerm));
	}

	// Create derived state for filtered items
	let filteredItems = $derived(getFilteredItems());

	// Update counts based on filtered items
	$effect(() => {
		storiesTotalSearch = filteredItems.length;
	});
</script>

<svelte:head>
	<title>Project Dashboard</title>
</svelte:head>

{#if initialLoad}
	<div class="section">
		<div class="container">
			<div class="columns is-centered">
				<div class="column is-half has-text-centered">
					<img
						src={thread}
						alt="Loading thread illustration"
						style="width: 50px; height: auto;"
						class="spinning-thread mb-3"
					/>
					<p class="is-size-5 has-text-weight-bold">Loading...</p>
				</div>
			</div>
		</div>
	</div>
	<style>
		.spinning-thread {
			animation: spinY 2s linear infinite;
		}
		@keyframes spinY {
			0% {
				transform: rotateY(0deg);
			}
			100% {
				transform: rotateY(360deg);
			}
		}
	</style>
{:else}
	<div class="container">
		<div class="has-text-left mb-3">
			<a href="/org/{projectData.org_id}" class="button is-light">
				<span class="icon">
					<i class="fa fa-arrow-left"></i>
				</span>
				<span>Back to Organization</span>
			</a>
		</div>
		<div class="breadcrumb-nav mb-5">
			<nav class="breadcrumb nav-color" aria-label="breadcrumbs">
				<ul>
					<li><a href="/">Home</a></li>
					<li>
						<a href="/org/{projectData.org_id}"
							><b>Organization</b>: {projectData.org_name || 'Organization'}</a
						>
					</li>
					<li class="is-active">
						<a href="/org/{projectData.org_id}/project/{projectData.name}" aria-current="page"
							><b>Project</b>: {projectData.project_name}</a
						>
					</li>
				</ul>
			</nav>
		</div>
		<div class="p-5">
			<ProjectHeader
				project_name={projectData.project_name}
				insight={projectData.insight}
				stories={projectData.stories}
				org_id={projectData.org_id}
				--card-color={themeColor}
			/>
		</div>

		<div class="pt-6">
			<div class="level">
				<div class="level-left">
					<div class="level-item">
						<div class="buttons has-addons">
							<button
								class="button {type === 'dash' ? 'active' : ''}"
								onclick={() => (type = 'dash')}>Dashboard</button
							>
							<button
								class="button {type === 'story' ? 'active' : ''}"
								onclick={() => (type = 'story')}>Story View</button
							>
						</div>
					</div>
					<div class="level-item pl-6">
						<a href="/org/{projectData.org_id}/story/new" class="button">
							<span class="icon">
								<i class="fa fa-plus"></i>
							</span>
							<span>Add Story</span>
						</a>
					</div>
				</div>
				<div class="level-right">
					<div class="level-item">
						<p class="subtitle is-5">
							<strong>{storiesTotalSearch}</strong> Stories
						</p>
					</div>
					{#if type === 'story'}
						<div class="level-item">
							<div class="field has-addons">
								<p class="control">
									<input
										class="input"
										type="text"
										bind:value={searchValue}
										placeholder={`Search for ${type}`}
									/>
								</p>
								<p class="control">
									<button class="button">Search</button>
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<hr />

		{#if isLoading}
			{#each [1, 2, 3] as project}
				<div class="columns mt-4 is-multiline">
					{#each [1, 2, 3] as _}
						<div class="column is-one-third">
							<div class="skeleton-block" style="height: 250px;"></div>
						</div>
					{/each}
				</div>
			{/each}
		{:else if !isLoading && stories.length !== 0}
			{#if type === 'dash'}
				<DataDashboard {stories} />
			{:else if type === 'story'}
				{#each filteredItems as story}
					<div class="">
						<StoryPreview {story} />
					</div>
				{/each}
			{/if}
		{:else}
			<div class="has-text-centered my-6">
				<p class="mb-2">
					No stories have been created for this project. Please create some stories.
				</p>
				<a href="/org/{org_id}/story/new" class="button is-primary is-small"> Create a Story</a>
			</div>
		{/if}
	</div>
{/if}

<!-- Chatbox Component -->
<div class="chatbox-container">
	<Chatbox apiEndpoint={projectChatApiEndpoint} />
</div>

<style>
	.container {
		margin: 30px;
	}

	li a {
		color: black;
	}

	li.is-active {
		color: #133335 !important;
	}

	button.active {
		background-color: #133335;
		color: white;
	}

feat/project-chat-perplexity
	.chatbox-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 1000;
		width: 400px; /* Or your preferred width */
		max-width: 90vw;
		height: 500px; /* Or your preferred height */
		max-height: 80vh;
	li a:hover {
		color: #56bcb3;
	}

	li.is-active a {
		color: #56bcb3 !important;

	}
</style>
