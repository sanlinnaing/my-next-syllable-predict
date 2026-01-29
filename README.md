# Myanmar Next Syllable Prediction using LSTM

This project implements a deep learning approach to **Next Syllable Prediction** for the Myanmar language. Due to the unique script characteristics of Myanmar, this project utilizes a linguistically aware syllable-breaking strategy.

## 🛠 Technical Workflow

### Phase 1: Linguistic Analysis and Syllable Extraction
Myanmar text lacks explicit word boundaries, requiring tokenization at the syllable level:
* **Syllable Extraction:** The `syllable_base_pattern` groups consonants and diacritics into single phonological units.
* **Real-time Prediction Logic:** The `syllable_break_pattern` isolates the **Onset** from the **Rhyme**, allowing suggestions even while mid-syllable.



### Phase 2: Dataset Loading and Sequence Engineering
* **Source:** Data is sourced from the **Wikimedia/Wikipedia** Myanmar corpus.
* **Sliding Window:** A `SEQUENCE_LENGTH` of 5 syllables is used as context.
* **Supervised Mapping:** Generates pairs of `Input (5 syllables) -> Target (1 next syllable)` and partial syllable "tail" mappings.

### Phase 3: Model Architecture
The model uses a **Recurrent Neural Network (RNN)** implemented in Keras:
* **Embedding Layer:** Maps syllables into a dense 256-dimensional vector space.
* **Bidirectional LSTM:** Captures forward and backward linguistic context.
* **Mixed Precision:** Utilizes **`mixed_float16`** for faster training.



### Phase 4: Inference and Generation
* **Temperature Sampling:** Adjusts the probability distribution for more or less "creative" results.
* **Top-N Predictions:** Returns multiple candidates, mirroring modern predictive text bars.

---

## 🏃 How to Run

It is highly recommended to use a **Python Virtual Environment** to manage dependencies.

1. **Create and activate a virtual environment**:
   ```bash
   # Create environment
   python -m venv venv
   
   # Activate (MacOS/Linux)
   source venv/bin/activate
   
   # Activate (Windows)
   .\venv\Scripts\activate
   ```
2. **Install the required Python packages and Jupyter environment**:
   ```bash
   pip install datasets mwparserfromhell seaborn scikit-learn tensorflow keras jupyterlab
   ```
3. **Run Jupyter notebook
   ```bash
   jupyter notebook
   ```