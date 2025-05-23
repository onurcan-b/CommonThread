<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { error } = $props();

	// Function to handle redirection
	function handleRedirect() {
		window.location.href = error.redirectPath;
	}

	let errorHeader = (error.code = 401 ? 'Unauthorized' : 'Error');
</script>

{#if error.show}
	<div class="modal is-active" transition:fade={{ duration: 200 }}>
		<div class="modal-background"></div>
		<div class="modal-card">
			<header class="modal-card-head has-background-danger">
				<p class="modal-card-title has-text-white">Error: {errorHeader}</p>
			</header>
			<section class="modal-card-body">
				<div class="content">
					<p>{error.message}</p>
				</div>
			</section>
			<footer class="modal-card-foot">
				<button class="button is-danger" onclick={handleRedirect}>{error.buttonText}</button>
			</footer>
		</div>
	</div>
{/if}
