<script>
  import { onMount } from 'svelte';
  import WordCloud from 'wordcloud';

  export let wordFrequencies = []; // Expects [["word", count], ...]
  let wordCloudCanvas;
  // Remove processText function and stopWords list

  function drawWordCloud() {
    if (!wordCloudCanvas || !wordFrequencies || wordFrequencies.length === 0) {
      const ctx = wordCloudCanvas.getContext('2d');
      ctx.clearRect(0, 0, wordCloudCanvas.width, wordCloudCanvas.height);
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Not enough data to generate a word cloud.", wordCloudCanvas.width/2, wordCloudCanvas.height/2);
      return;
    }

    WordCloud(wordCloudCanvas, {
      list: wordFrequencies, // Use the prop directly
      gridSize: Math.round(16 * wordCloudCanvas.width / 1024),
      weightFactor: function (size) {
        // Ensure size is not zero to prevent issues with pow if a count is 0 or 1
        return Math.pow(size > 1 ? size : 1.1, 1.8) * wordCloudCanvas.width / 512;
      },
      fontFamily: 'Arial, sans-serif',
      color: 'random-dark',
      backgroundColor: '#f0f0f0',
      minSize: Math.max(5, wordCloudCanvas.width / 200), // minSize responsive to canvas size
    });
  }

  onMount(() => {
    if (wordCloudCanvas) {
        if(wordCloudCanvas.width === 0) wordCloudCanvas.width = 500; // Default width
        if(wordCloudCanvas.height === 0) wordCloudCanvas.height = 300; // Default height
        drawWordCloud();
    }
  });

  // Reactive statement to redraw when wordFrequencies changes
  $: if (wordFrequencies && wordCloudCanvas) {
    drawWordCloud();
  }
</script>

<div class="wordcloud-container">
  <canvas bind:this={wordCloudCanvas} id="wordCloudCanvas"></canvas>
</div>

<style>
  .wordcloud-container {
    width: 100%;
    max-width: 600px; /* Or any desired max width */
    margin: auto;
  }
  #wordCloudCanvas {
    width: 100%;
    height: auto; /* Maintain aspect ratio */
    /* Or set fixed dimensions:
    width: 600px;
    height: 400px; */
  }
</style>
