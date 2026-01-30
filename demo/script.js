// --- Configuration and Placeholders ---
const MODEL_PATH = 'https://raw.githubusercontent.com/sanlinnaing/my-next-syllable-predict/main/syll_predict_model.tflite';
const SYLL_INDICES_PATH = 'https://raw.githubusercontent.com/sanlinnaing/my-next-syllable-predict/main/syll_indices.json';
const SEQUENCE_LENGTH = 5;

// --- DOM Elements ---
const textInput = document.getElementById('text-input');
const ghostTextElement = document.getElementById('ghost-text');
const suggestionsElement = document.getElementById('suggestions');

// --- Model and State ---
let model = null;
let syllIndices = null;
let indicesSyll = null;
let currentText = '';

// --- Linguistic Functions (Ported from Python) ---

const cons = "\u1000-\u1021";
const cons_init = `[${cons}\u1025\u1027\u1029\u103f]`;
const medial = "[\u103b-\u103e]{1,4}";
const vowel = "[\u102b-\u1032]{1,2}\u103a?";
const independent_vowel = "[\u1023-\u1027\u1029\u102a]";
const asat = "\u103a";
const virama = "\u1039";
const cons_asat = `[${cons}](?:${asat}${virama}|[${asat}${virama}])`;
const kinzi = `[\u1004\u101b]${asat}${virama}`;
const tone = "[\u1036\u1037\u1038]{1,2}";
const legaund = `\u104e\u1004${asat}\u1038|\u104e\u1004${asat}`;
const symbol1 = `[\u104c\u104d\u104f]|${legaund}|\u104e`;
const symbol2 = `${cons}\u103b${asat}`;
const contra1 = "\u103b\u102c";
const others = " ";

const syllable_base_pattern = `${cons_init}(?:${medial})?(?:${vowel})?(?:${cons_asat}(?:${contra1})?)?(?:${tone})?`;

const syllable_pattern = new RegExp(`(${symbol1}|${symbol2}|${syllable_base_pattern}|${independent_vowel}|${others})`, 'g');

const cons_init_pattern = `(?<consonant>[${cons}\u1025\u1027\u1029\u103f])`;
const tail_pattern = `(?<tail>(?:${medial})?(?:${vowel})?(?:${cons_asat}(?:${contra1})?)?(?:${tone})?)`;
const syllable_break_pattern = new RegExp(cons_init_pattern + tail_pattern);


function extract_syllables(text) {
    text = text.replace('\u1037\u103a','\u103a\u1037');
    const syllables = text.match(syllable_pattern);
    return syllables ? syllables.filter(s => s) : [];
}

function seperate_cons_tail(text) {
    const match = text.match(syllable_break_pattern);
    if (match && match.groups) {
        return [match.groups.consonant, match.groups.tail];
    }
    return null;
}

// --- Core Functions ---

/**
 * Loads the TFLite model and vocabulary.
 */
async function loadApp() {
    try {
        [model, syllIndices] = await Promise.all([
            tflite.loadTFLiteModel(MODEL_PATH),
            fetch(SYLL_INDICES_PATH).then(res => res.json())
        ]);
        indicesSyll = Object.fromEntries(Object.entries(syllIndices).map(([key, value]) => [value, key]));
        console.log('Model and vocabulary loaded successfully.');
    } catch (error) {
        console.error('Failed to load model or vocabulary:', error);
        alert('Error: Could not load the prediction model or vocabulary. See console for details.');
    }
}

/**
 * Preprocesses the input text into a tensor for the model.
 * @param {string} text The input text.
 * @returns {tf.Tensor} A tensor representing the text.
 */
function preprocessText(text) {
    const syllables = extract_syllables(text);
    const lastSyllables = syllables.slice(-SEQUENCE_LENGTH);
    
    const indices = lastSyllables.map(syll => syllIndices[syll] !== undefined ? syllIndices[syll] : 0);

    const paddedIndices = Array(SEQUENCE_LENGTH).fill(0);
    for (let i = 0; i < indices.length; i++) {
        paddedIndices[paddedIndices.length - indices.length + i] = indices[i];
    }

    return tf.tensor2d([paddedIndices], [1, SEQUENCE_LENGTH], 'float32');
}

/**
 * Decodes the model's prediction into human-readable text.
 * @param {tf.Tensor} prediction The model's output tensor.
 * @returns {Array<{syllable: string, confidence: number}>} An array of top predictions.
 */
function decodePrediction(prediction) {
    const outputProbabilities = prediction.dataSync();
    const top3Indices = sample(outputProbabilities, 1.0, 3);
    
    return top3Indices.map(index => {
        return {
            syllable: indicesSyll[index] || '',
            confidence: outputProbabilities[index]
        }
    });
}

/**
 * Samples top N indices from a probability distribution.
 * @param {Float32Array} preds The prediction probabilities.
 * @param {number} temperature The sampling temperature.
 * @param {number} top_n The number of top indices to return.
 * @returns {Array<number>} An array of the top N indices.
 */
function sample(preds, temperature = 1.0, top_n = 3) {
    const predsWithIndices = Array.from(preds).map((p, i) => [p, i]);
    predsWithIndices.sort((a, b) => b[0] - a[0]);
    
    // Filter out index 0 (space)
    const filteredPreds = predsWithIndices.filter(p => p[1] !== 0);

    return filteredPreds.slice(0, top_n).map(p => p[1]);
}


/**
 * Runs the prediction and updates the UI.
 * @param {string} inputText The text from the input field.
 */
async function runPrediction(inputText) {
    if (!model || !syllIndices || !inputText) {
        updateUI('', []);
        return;
    }

    // 1. Preprocess the input
    const inputTensor = preprocessText(inputText);

    // 2. Run the model
    let prediction;
    try {
        prediction = model.predict(inputTensor);
    } catch (error) {
        console.error("Error during prediction:", error);
        return;
    }

    // 3. Decode the output
    const suggestions = decodePrediction(prediction);

    // 4. Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    // 5. Update UI
    const ghostSuggestion = suggestions.length > 0 ? suggestions[0].syllable : '';
    updateUI(ghostSuggestion, suggestions);
}

// --- UI Functions ---

/**
 * Updates the ghost text and suggestion buttons.
 * @param {string} ghostText The text to display as a ghost suggestion.
 * @param {Array<{syllable: string, confidence: number}>} suggestions The list of suggestions.
 */
function updateUI(ghostText, suggestions) {
    // Update ghost text
    const fullGhostText = textInput.value + ghostText;
    ghostTextElement.innerText = fullGhostText;

    // Update suggestion buttons
    suggestionsElement.innerHTML = '';
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggestion';
        button.innerText = `${suggestion.syllable} (${(suggestion.confidence * 100).toFixed(0)}%)`;
        button.onclick = () => {
            textInput.value += suggestion.syllable;
            textInput.focus();
            runPrediction(textInput.value);
        };
        suggestionsElement.appendChild(button);
    });
}

// --- Event Listeners ---

textInput.addEventListener('input', (e) => {
    currentText = e.target.value;
    runPrediction(currentText);
});

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && ghostTextElement.innerText) {
        e.preventDefault();
        const ghostSuggestion = ghostTextElement.innerText.substring(textInput.value.length);
        if (ghostSuggestion) {
            textInput.value += ghostSuggestion;
            currentText = textInput.value;
            runPrediction(currentText);
        }
    }
});

// --- Initialization ---

// Load the model and vocabulary when the script is loaded
loadApp();