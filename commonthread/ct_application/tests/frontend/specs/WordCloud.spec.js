// commonthread/ct_application/tests/frontend/specs/WordCloud.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import WordCloud from '$lib/components/WordCloud.svelte'; // Adjust path if necessary

// Mock the 'wordcloud' library
// The actual WordCloud function draws on a canvas, which is hard to test.
// We can mock it to see if it's called with the correct parameters.
// Vitest's vi.mock is hoisted, so this will apply to all imports.
const mockWordCloudImplementation = vi.fn();
vi.mock('wordcloud', () => {
  // Default export for 'wordcloud' library
  return {
    default: mockWordCloudImplementation, // Mock the default export
  };
});

describe('WordCloud.svelte', () => {
  beforeEach(() => {
    // Reset the mock before each test to clear call history
    mockWordCloudImplementation.mockClear();
  });

  afterEach(() => {
    cleanup(); // Clean up DOM after each test
  });

  it('renders a canvas element', () => {
    const { container } = render(WordCloud, { props: { wordFrequencies: [['test', 1]] } });
    const canvas = container.querySelector('canvas#wordCloudCanvas');
    expect(canvas).not.toBeNull();
    expect(canvas instanceof HTMLCanvasElement).toBe(true);
  });

  it('calls WordCloud library with correct data when wordFrequencies are provided', () => {
    const frequencies = [['hello', 2], ['world', 3]];
    render(WordCloud, { props: { wordFrequencies: frequencies } });
    
    // Check if the WordCloud library function was called
    expect(mockWordCloudImplementation).toHaveBeenCalled();
    const callOptions = mockWordCloudImplementation.mock.calls[0][1]; // Get options from the first call
    expect(callOptions.list).toEqual(frequencies);
  });

  it('displays "Not enough data" message on canvas if wordFrequencies is empty', async () => {
    // For this test, we are checking that the WordCloud library is NOT called with actual data.
    // The component itself handles drawing the "Not enough data" message.
    const { container } = render(WordCloud, { props: { wordFrequencies: [] } });
    const canvas = container.querySelector('canvas#wordCloudCanvas');
    expect(canvas).not.toBeNull();

    // Check that the WordCloud library was not called with a list that has items.
    // The component's logic should prevent calling WordCloud() with an empty list in a way
    // that would render a cloud. Instead, it draws the message directly.
    // So, if WordCloud was called, its 'list' option should be empty or not present.
    // Or, it might not be called at all if the canvas is prepared directly.
    // Given our mock, we check if it was called, what it was called with.
    // The component's drawWordCloud function has a check:
    // if (!wordCloudCanvas || !wordFrequencies || wordFrequencies.length === 0) { ... draw message ... return; }
    // So, the WordCloud() function should NOT be called.
    expect(mockWordCloudImplementation).not.toHaveBeenCalled();
    
    // To actually test canvas text, we'd need a more complex setup (e.g., jest-canvas-mock or visual testing)
    // For now, we trust the component's internal logic and that WordCloud lib isn't called.
    // We can also check the canvas's initial dimensions were set.
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });

  it('handles null wordFrequencies gracefully (renders "Not enough data" message)', async () => {
    const { container } = render(WordCloud, { props: { wordFrequencies: null } });
    const canvas = container.querySelector('canvas#wordCloudCanvas');
    expect(canvas).not.toBeNull();

    // Similar to the empty array test, WordCloud() should not be called with data.
    expect(mockWordCloudImplementation).not.toHaveBeenCalled();
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });

  it('updates the word cloud when wordFrequencies prop changes', async () => {
    const initialFrequencies = [['initial', 1]];
    const { component } = render(WordCloud, { props: { wordFrequencies: initialFrequencies } });

    // WordCloud should have been called once for initial render
    expect(mockWordCloudImplementation).toHaveBeenCalledTimes(1);
    expect(mockWordCloudImplementation.mock.calls[0][1].list).toEqual(initialFrequencies);

    mockWordCloudImplementation.mockClear(); // Clear calls for the next check

    const newFrequencies = [['new', 5], ['data', 2]];
    await component.$set({ wordFrequencies: newFrequencies });

    // WordCloud should be called again due to reactive update
    expect(mockWordCloudImplementation).toHaveBeenCalledTimes(1);
    expect(mockWordCloudImplementation.mock.calls[0][1].list).toEqual(newFrequencies);
  });
});
